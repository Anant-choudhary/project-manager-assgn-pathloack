using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Models;

namespace ProjectManager.Services;

public interface ITaskService
{
    Task<TaskDto?> CreateTaskAsync(int projectId, CreateTaskDto createDto, int userId);
    Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto updateDto, int userId);
    Task<bool> DeleteTaskAsync(int taskId, int userId);
}

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaskDto?> CreateTaskAsync(int projectId, CreateTaskDto createDto, int userId)
    {
        // Verify project belongs to user
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null)
            return null;

        var task = new ProjectTask
        {
            Title = createDto.Title,
            DueDate = createDto.DueDate,
            ProjectId = projectId,
            CreatedAt = DateTime.UtcNow,
            IsCompleted = false,
            EstimatedHours = createDto.EstimatedHours
        };

        Console.WriteLine("Dependencies: " + createDto.Dependencies);    //debugging    
        // Handle dependencies (single only)
         if (createDto.Dependencies != null && createDto.Dependencies.Count > 0)
        {
            Console.WriteLine("Dependencies: " + createDto.Dependencies[0]);    //debugging
            var depId = createDto.Dependencies[0];
            var dependency = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == depId && t.ProjectId == projectId);
            if (dependency != null)
            task.Dependencies.Add(dependency);
        }
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            ProjectId = task.ProjectId,
            Dependencies = task.Dependencies.Select(dt => dt.Id).ToList(),
            EstimatedHours = task.EstimatedHours
        };
    }

    public async Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto updateDto, int userId)
    {
        // Verify task belongs to user's project
        var task = await _context.Tasks.Include(t => t.Dependencies).Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);
        if (task == null) return null;

        if (updateDto.Title != null)
            task.Title = updateDto.Title;
        if (updateDto.DueDate.HasValue)
            task.DueDate = updateDto.DueDate.Value;
        if (updateDto.IsCompleted.HasValue)
            task.IsCompleted = updateDto.IsCompleted.Value;
        if (updateDto.EstimatedHours.HasValue)
            task.EstimatedHours = updateDto.EstimatedHours.Value;
        if (updateDto.Dependencies != null)
        {
            // Overwrite dependencies, only one allowed
            task.Dependencies.Clear();
            if (updateDto.Dependencies.Count > 0)
            {
                var depId = updateDto.Dependencies[0];
                var dependency = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == depId && t.ProjectId == task.ProjectId);
                if (dependency != null)
                    task.Dependencies.Add(dependency);
            }
        }
        await _context.SaveChangesAsync();

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            ProjectId = task.ProjectId,
            Dependencies = task.Dependencies.Select(dt => dt.Id).ToList(),
            EstimatedHours = task.EstimatedHours
        };
    }

    public async Task<bool> DeleteTaskAsync(int taskId, int userId)
    {
        // Verify task belongs to user's project
        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);

        if (task == null)
            return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}