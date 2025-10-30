import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { ProjectCard } from './ProjectCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Buttons';
import { LogOut } from 'lucide-react';
import { ProjectForm } from './ProjectForm';
import { Alert } from '../common/Alert';
import { FolderPlus } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Project, ProjectFormData } from '../../types';

interface DashboardProps {
  onNavigate: (page: string, params?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [apiError, setApiError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: ProjectFormData) => {
    try {
      await api.projects.create(formData);
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.projects.delete(id);
      loadProjects();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {apiError && <Alert message={apiError} onClose={() => setApiError('')} />}

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 inline mr-2" />
            New Project
          </Button>
        </div>

        {showForm && (
          <ProjectForm 
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No projects yet</h3>
            <p className="text-gray-500">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onView={(id) => onNavigate('project', id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};