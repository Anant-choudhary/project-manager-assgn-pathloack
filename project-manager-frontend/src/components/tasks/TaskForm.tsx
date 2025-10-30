import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Buttons';
import { TaskFormData } from '../../types';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  allTasks?: { id: string, title: string }[]; 
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, allTasks = [] }) => {
  const [formData, setFormData] = useState<TaskFormData>({ title: '', dueDate: '', dependencies: [], estimatedHours: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
      <div>
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          placeholder="Enter task title"
        />
        
        <Input
          label="Due Date (Optional)"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
        <Input
          label="Estimated Hours"
          type="number"
          value={String(formData.estimatedHours ?? 1)}
          onChange={(e) => setFormData({ ...formData, estimatedHours: Math.max(0, Number(e.target.value)) })}
        />
        {/* Dependencies multi-select */}
        {allTasks.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Select ONE task this task depends on (prerequisite)
            </label>
            <div className="space-y-1 p-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="dependency"
                  value=""
                  checked={!(formData.dependencies && formData.dependencies.length)}
                  onChange={() => setFormData({ ...formData, dependencies: [] })}
                />
                No dependency
              </label>
              {allTasks.filter(t => t.title !== formData.title).map(task => (
                <label key={task.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="dependency"
                    value={task.id}
                    checked={formData.dependencies && formData.dependencies[0] === task.id}
                    onChange={() => setFormData({ ...formData, dependencies: [task.id] })}
                  />
                  {task.title}
                </label>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-1">(Pick at most one prerequisite; select 'No dependency' to have none)</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Create Task</Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};