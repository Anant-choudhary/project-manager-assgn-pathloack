import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskItem } from '../components/tasks/TaskItem';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Buttons';
import { Plus } from 'lucide-react';
import { Project, Task, TaskFormData, ScheduleTasksRequest, ScheduleTasksResponse, ScheduleTaskInput } from '../types';


interface ProjectDetailsProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onNavigate }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<string[] | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await api.projects.getById(projectId);
      setProject(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      await api.tasks.create(projectId, {
        title: formData.title,
        dueDate: formData.dueDate || undefined,
        dependencies: formData.dependencies || [],
        estimatedHours: formData.estimatedHours ?? 1
      });
      setShowForm(false);
      loadProject();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const task = project?.tasks?.find((t: Task)=> t.id === taskId);
      if (task) {
        await api.tasks.update(taskId, { ...task, ...updates });
        loadProject();
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.tasks.delete(taskId);
      loadProject();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const toggleTaskCompletion = (task: Task) => {
    handleUpdateTask(task.id, { isCompleted: !task.isCompleted });
  };

  const handleGetSchedule = async () => {
    if (!project?.tasks || project.tasks.length === 0) return;
    setScheduleLoading(true);
    setScheduleResult(null);
    setApiError('');
    try {
      // Build a map for id -> title
      const idToTitle: Record<string, string> = {};
      project.tasks.forEach(t => { idToTitle[t.id] = t.title; });
      const schedulerTasks: ScheduleTaskInput[] = project.tasks.map(task => ({
        title: task.title,
        estimatedHours: task.estimatedHours ?? 1,
        dueDate: task.dueDate || new Date().toISOString(),
        dependencies: (task.dependencies || []).map(depId => idToTitle[depId]).filter(Boolean),
      }));
      const response = await api.projects.getRecommendedTaskOrder(projectId, schedulerTasks);
      setScheduleResult(response.recommendedOrder);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to get recommended order');
    } finally {
      setScheduleLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return <LoadingSpinner message="Project not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {apiError && <Alert message={apiError} onClose={() => setApiError('')} />}

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 inline mr-2" />
            Add Task
          </Button>
        </div>

        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            allTasks={project.tasks?.map(t => ({ id: t.id, title: t.title }))}
          />
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            
            {!project.tasks || project.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks yet. Add your first task to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {project.tasks.map((task : any) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskCompletion}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={handleGetSchedule}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-50"
            disabled={!project.tasks?.length || scheduleLoading}
          >
            {scheduleLoading ? 'Scheduling...' : 'Get Recommended Task Order'}
          </button>
          {scheduleResult && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
              <div className="font-semibold mb-2">Recommended Order:</div>
              <ol className="list-decimal ml-6">
                {scheduleResult.map(title => (
                  <li key={title}>{title}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
