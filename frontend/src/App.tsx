import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FormsDirectoryPage } from './pages/FormsDirectoryPage';
import { FormPage } from './pages/FormPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Handle browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (currentPath === '/forms' || currentPath === '/forms/') {
      return <FormsDirectoryPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/forms/')) {
      const formId = currentPath.replace('/forms/', '').replace(/\/$/, '');
      return <FormPage formId={formId} onNavigate={navigate} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    if (currentPath === '/privacy') {
      return <PrivacyPage />;
    }

    if (currentPath === '/terms') {
      return <TermsPage />;
    }

    // Default Fallback
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1 flex flex-col">{renderContent()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default App;
