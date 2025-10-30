import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => (
  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
    <button onClick={() => onToggle(task)} className="flex-shrink-0">
      {task.isCompleted ? (
        <CheckCircle className="w-6 h-6 text-green-600" />
      ) : (
        <Circle className="w-6 h-6 text-gray-400" />
      )}
    </button>
    
    <div className="flex-1">
      <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
        {task.title}
      </h3>
      {task.dueDate && (
        <p className="text-sm text-gray-600">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
    
    <button
      onClick={() => onDelete(task.id)}
      className="text-red-600 hover:text-red-800 p-2"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  </div>
);