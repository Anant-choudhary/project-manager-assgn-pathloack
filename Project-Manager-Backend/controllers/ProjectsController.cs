using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.DTOs;
using ProjectManager.Services;
using System.Security.Claims;

namespace ProjectManager.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ITaskService _taskService;

    public ProjectsController(IProjectService projectService, ITaskService taskService)
    {
        _projectService = projectService;
        _taskService = taskService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = GetUserId();
        var projects = await _projectService.GetUserProjectsAsync(userId);
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(int id)
    {
        var userId = GetUserId();
        var project = await _projectService.GetProjectByIdAsync(id, userId);

        if (project == null)
            return NotFound(new { message = "Project not found" });

        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto createDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        var project = await _projectService.CreateProjectAsync(createDto, userId);

        return CreatedAtAction(nameof(GetProject), new { id = project!.Id }, project);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = GetUserId();
        var success = await _projectService.DeleteProjectAsync(id, userId);

        if (!success)
            return NotFound(new { message = "Project not found" });

        return NoContent();
    }

    [HttpPost("{projectId}/tasks")]
    public async Task<IActionResult> CreateTask(int projectId, [FromBody] CreateTaskDto createDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        var task = await _taskService.CreateTaskAsync(projectId, createDto, userId);

        if (task == null)
            return NotFound(new { message = "Project not found" });

        return CreatedAtAction(nameof(GetProject), new { id = projectId }, task);
    }

    [HttpPost("{projectId}/schedule")]
    public IActionResult ScheduleTasks(int projectId, [FromBody] ScheduleTasksRequestDto request)
    {
        if (request.Tasks == null || request.Tasks.Count == 0)
            return BadRequest(new { message = "No tasks provided" });

        var order = TopologicalSortTasks(request.Tasks);

        if (order == null)
            return BadRequest(new { message = "Cyclic dependency detected" });

        var response = new ScheduleTasksResponseDto { RecommendedOrder = order };
        return Ok(response);
    }

    // Helper for topological sort
    private List<string>? TopologicalSortTasks(List<ScheduleTaskInputDto> tasks)
    {
        // Build quick lookup for attributes
        var taskInfo = tasks.ToDictionary(t => t.Title, t => new { t.DueDate, t.EstimatedHours });

        // Kahn's algorithm with priority selection by (DueDate asc, EstimatedHours asc)
        var order = new List<string>();
        var indegree = new Dictionary<string, int>();
        var graph = new Dictionary<string, List<string>>();
        foreach (var task in tasks)
        {
            indegree[task.Title] = 0;
            graph[task.Title] = new List<string>();
        }
        foreach (var task in tasks)
        {
            foreach (var dep in task.Dependencies)
            {
                if (!graph.ContainsKey(dep))
                    return null; // Dependency not found among input tasks
                graph[dep].Add(task.Title);
                indegree[task.Title]++;
            }
        }
        // Initialize available set
        var available = indegree.Where(kv => kv.Value == 0).Select(kv => kv.Key).ToList();
        while (available.Count > 0)
        {
            // pick by earliest due date, then smallest estimated hours
            available.Sort((a, b) =>
            {
                var ai = taskInfo[a];
                var bi = taskInfo[b];
                var cmp = DateTime.Compare(ai.DueDate, bi.DueDate);
                if (cmp != 0) return cmp;
                return ai.EstimatedHours.CompareTo(bi.EstimatedHours);
            });
            var node = available[0];
            available.RemoveAt(0);

            order.Add(node);
            foreach (var neigh in graph[node])
            {
                indegree[neigh]--;
                if (indegree[neigh] == 0)
                    available.Add(neigh);
            }
        }
        if (order.Count != tasks.Count)
            return null; // Cycle detected
        return order;
    }
}