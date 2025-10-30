import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Alert } from '../common/Alert';
import { Button } from '../common/Buttons';
import { Input } from '../common/Input';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isLogin && !formData.username.trim())
      newErrors.username = 'Username is required';

    if (!isLogin && !formData.email)
      newErrors.email = 'Email is required';
    else if (!isLogin && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!isLogin && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      if (isLogin) {

        const data = await api.auth.login({
          username: formData.username,
          password: formData.password,
        });
        login(data.token);
      } else {
        // 🆕 Register with username + email + password
        const data = await api.auth.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        login(data.token);
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

 
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isLogin ? 'Sign in to manage your projects' : 'Sign up to get started'}
        </p>

        {apiError && <Alert message={apiError} onClose={() => setApiError('')} />}

        <div onKeyPress={handleKeyPress}>

          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={errors.username}
            placeholder="yourusername"
          />


          {!isLogin && (
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="you@example.com"
            />
          )}

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="••••••••"
          />

          {!isLogin && (
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setApiError('');
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
