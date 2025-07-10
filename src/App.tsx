import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';

// --- 페이지 import ---
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JoinPage from './pages/JoinPage';
import TeacherClassPage from './pages/TeacherClassPage';
import StudentClassPage from './pages/StudentClassPage';
// --- 컴포넌트 import ---
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function App() {
  const { isLoggedIn, silentRefresh } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await silentRefresh();
      setIsLoading(false);
    };
    initializeApp();
  }, [silentRefresh]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/join" /> : <LoginPage />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/join" /> : <SignupPage />} />

        {/* --- Private Routes --- */}
        <Route
          path="/join"
          element={
            <PrivateRoute>
              <JoinPage />
            </PrivateRoute>
          }
        />

        {/* 👇 1. 교사용 페이지 라우트 추가 및 PrivateRoute 적용 */}
        <Route
          path="/room/:roomId"
          element={
            <PrivateRoute>
              <TeacherClassPage />
            </PrivateRoute>
          }
        />

        {/* 👇 2. 학생용 페이지 라우트를 동적으로 변경 및 PrivateRoute 적용 */}
        <Route
          path="/class/:roomId"
          element={
            <PrivateRoute>
              <StudentClassPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
