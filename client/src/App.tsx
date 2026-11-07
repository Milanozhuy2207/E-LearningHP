import React, { useEffect, useState } from 'react';
import { PortalPage, StudentRecord } from './pages/PortalPage';
import { LearnPage } from './pages/LearnPage';
import { AdminPage } from './pages/AdminPage';

type ViewMode = 'portal' | 'learn' | 'admin';

function resolveViewFromPath(pathname: string): ViewMode {
  const lower = pathname.toLowerCase();
  if (lower.startsWith('/admin') || lower.startsWith('/teacher')) return 'admin';
  if (lower.startsWith('/learn')) return 'learn';
  return 'portal';
}

function getStoredStudent(): StudentRecord | null {
  try {
    const raw = sessionStorage.getItem('currentStudent');
    if (!raw) return null;
    return JSON.parse(raw) as StudentRecord;
  } catch {
    return null;
  }
}

export const App: React.FC = () => {
  const [student, setStudent] = useState<StudentRecord | null>(() => getStoredStudent());
  const [view, setView] = useState<ViewMode>(() => {
    const initialView = resolveViewFromPath(window.location.pathname);
    if (initialView === 'learn' && !getStoredStudent()) {
      return 'portal';
    }
    return initialView;
  });

  useEffect(() => {
    // Chuẩn hóa đường dẫn cũ /teacher về /admin
    if (window.location.pathname.toLowerCase().startsWith('/teacher')) {
      window.history.replaceState({}, '', '/admin');
    }

    const handlePopState = () => {
      const nextView = resolveViewFromPath(window.location.pathname);
      const currentStored = getStoredStudent();
      setStudent(currentStored);
      if (nextView === 'learn' && !currentStored) {
        setView('portal');
      } else {
        setView(nextView);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextView: ViewMode, path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setView(nextView);
  };

  const handleSelectStudent = (selectedStudent: StudentRecord) => {
    sessionStorage.setItem('currentStudent', JSON.stringify(selectedStudent));
    setStudent(selectedStudent);
    navigateTo('learn', '/learn');
  };

  const handleNavigatePortal = () => {
    navigateTo('portal', '/');
  };

  // Giao diện 2: Cổng Quản Trị Admin dành riêng cho Thầy Cô (/admin)
  if (view === 'admin') {
    return <AdminPage onOpenStudentPortal={handleNavigatePortal} />;
  }

  // Giao diện 1: Cổng Học Sinh (/ và /learn)
  if (view === 'learn' && student) {
    return <LearnPage student={student} onNavigatePortal={handleNavigatePortal} />;
  }

  return <PortalPage onSelectStudent={handleSelectStudent} />;
};
