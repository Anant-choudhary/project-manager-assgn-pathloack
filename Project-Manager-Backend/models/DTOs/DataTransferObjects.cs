using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs;

// Auth DTOs
public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

// Project DTOs
public class CreateProjectDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
}

public class ProjectDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TaskCount { get; set; }
}

public class ProjectDetailsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TaskDto> Tasks { get; set; } = new();
}

// Task DTOs
public class CreateTaskDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    public List<int> Dependencies { get; set; } = new();
    
    [Range(0, int.MaxValue)]
    public int EstimatedHours { get; set; } = 0;
}

public class UpdateTaskDto
{
    [StringLength(200)]
    public string? Title { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public bool? IsCompleted { get; set; }
    public List<int>? Dependencies { get; set; }

    [Range(0, int.MaxValue)]
    public int? EstimatedHours { get; set; }
}

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ProjectId { get; set; }
    public List<int> Dependencies { get; set; } = new();
    public int EstimatedHours { get; set; }
}

// Smart Scheduler DTOs
public class ScheduleTaskInputDto
{
    public string Title { get; set; } = string.Empty;
    public int EstimatedHours { get; set; }
    public DateTime DueDate { get; set; }
    public List<string> Dependencies { get; set; } = new();
}

public class ScheduleTasksRequestDto
{
    public List<ScheduleTaskInputDto> Tasks { get; set; } = new();
}

public class ScheduleTasksResponseDto
{
    public List<string> RecommendedOrder { get; set; } = new();
}