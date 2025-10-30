import { Button } from "../common/Buttons";
import { Trash2, Eye } from "lucide-react";
import { Project } from "../../types";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onView }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800 flex-1">{project.title}</h3>
        <button
          onClick={() => onDelete(project.id)}
          className="text-red-600 hover:text-red-800 p-1"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {project.description && (
        <p className="text-gray-600 mb-4">{project.description}</p>
      )}
      
      <div className="text-sm text-gray-500 mb-4">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {project.tasks?.length || 0} tasks
        </span>
        <Button onClick={() => onView(project.id)}>
          View Details
        </Button>
      </div>
    </div>
  </div>
);