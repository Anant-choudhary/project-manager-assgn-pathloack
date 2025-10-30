using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Models;

namespace ProjectManager.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetUserProjectsAsync(int userId);
    Task<ProjectDetailsDto?> GetProjectByIdAsync(int projectId, int userId);
    Task<ProjectDto?> CreateProjectAsync(CreateProjectDto createDto, int userId);
    Task<bool> DeleteProjectAsync(int projectId, int userId);
}

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(int userId)
    {
        return await _context.Projects
            .Where(p => p.UserId == userId)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                TaskCount = p.Tasks.Count
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<ProjectDetailsDto?> GetProjectByIdAsync(int projectId, int userId)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .ThenInclude(t => t.Dependencies)
            .Where(p => p.Id == projectId && p.UserId == userId)
            .FirstOrDefaultAsync();

        if (project == null)
            return null;

        return new ProjectDetailsDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            Tasks = project.Tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt,
                ProjectId = t.ProjectId,
                Dependencies = t.Dependencies.Select(d => d.Id).ToList(),
                EstimatedHours = t.EstimatedHours
            })
            .OrderBy(t => t.IsCompleted)
            .ThenBy(t => t.DueDate)
            .ToList()
        };
    }

    public async Task<ProjectDto?> CreateProjectAsync(CreateProjectDto createDto, int userId)
    {
        var project = new Project
        {
            Title = createDto.Title,
            Description = createDto.Description,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return new ProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            TaskCount = 0
        };
    }

    public async Task<bool> DeleteProjectAsync(int projectId, int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null)
            return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }
}