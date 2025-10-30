using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

public class Project
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}

public class ProjectTask
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public bool IsCompleted { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int EstimatedHours { get; set; } = 0;
    
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public ICollection<ProjectTask> Dependencies { get; set; } = new List<ProjectTask>();
    public ICollection<ProjectTask> DependentOnMe { get; set; } = new List<ProjectTask>();
}