//Coconut-Frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JoinPage from './pages/JoinPage'; // JoinPage import
import { useAuthStore } from './store/auth/authStore';
import PrivateRoute from './components/PrivateRoute';
import { useEffect, useState } from 'react';
import ProblemImportForm from './components/teacher-class/ProblemImportForm';
import ProblemCreateForm from './components/teacher-class/ProblemCreateForm';
import StudentClassPage from './pages/StudentClassPage';
import './App.css';

function App() {
  const { isLoggedIn, silentRefresh } = useAuthStore();
  // 재인증 로딩 상태를 관리합니다.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // 앱 시작 시 토큰 재발급을 시도합니다.
      await silentRefresh();
      // 재발급 시도가 끝나면 로딩 상태를 해제합니다.
      setIsLoading(false);
    };

    initializeApp();
  }, [silentRefresh]); // silentRefresh는 한번만 실행되므로 의존성 배열에 추가

  // 로딩 중일 때는 아무것도 보여주지 않거나 로딩 스피너를 보여줍니다.
  if (isLoading) {
    return <div>Loading...</div>; // 또는 <LoadingSpinner />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- 로그인 전 --- */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/join" /> : <LoginPage />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/join" /> : <SignupPage />} />

        {/* --- 로그인 후 --- */}
        <Route
          path="/join"
          element={
            <PrivateRoute>
              <JoinPage />
            </PrivateRoute>
          }
        />
        <Route path="/editor/:editorId" element={<StudentClassPage />} />
        {/*<Route path="/teacher-class" element={<TeacherClassPage />} />*/}
        <Route path="/teacher-class/:roomId/import" element={<ProblemImportForm />} />
        <Route path="/teacher-class/:roomId/create" element={<ProblemCreateForm />} />
        <Route path="/class" element={<StudentClassPage />} />
        {/* 다른 라우트 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
