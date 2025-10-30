import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { ProjectDetails } from './pages/ProjectDetails';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/projects/Dashboard';
import exp from 'constants';

const App: React.FC = () => {
  const [route, setRoute] = useState<{ page: string; params: string | null }>({ 
    page: 'auth', 
    params: null 
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && route.page === 'auth') {
      setRoute({ page: 'dashboard', params: null });
    } else if (!isAuthenticated) {
      setRoute({ page: 'auth', params: null });
    }
  }, [isAuthenticated]);

  const navigate = (page: string, params: string | null = null) => {
    setRoute({ page, params });
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      {route.page === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {route.page === 'project' && route.params && (
        <ProjectDetails projectId={route.params} onNavigate={navigate} />
      )}
    </>
  );
};

export default App;