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
import MyPage from './pages/MyPage';
import ReportPage from './pages/ReportPage';
import StudentReportPage from './pages/StudentReportPage';

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

  // 로딩이 끝나면 스플래시 스크린을 숨깁니다.
  useEffect(() => {
    if (!isLoading) {
      const splashScreen = document.getElementById('splash-screen');
      if (splashScreen) {
        // 이제 CSS 애니메이션이 없으므로, 즉시 DOM에서 제거합니다.
        splashScreen.remove();
      }
    }
  }, [isLoading]);

  // React는 로딩 중 아무것도 렌더링하지 않습니다.
  // 실제 로딩 표시는 index.html의 스플래시 스크린이 담당합니다.
  if (isLoading) {
    return null;
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

        {/* 👇 3. 마이페이지 라우트 추가 및 PrivateRoute 적용 */}
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />

        {/* 👇 4. 리포트 페이지 라우트 추가 및 PrivateRoute 적용 */}
        <Route
          path="/room/:roomId/report"
          element={
            <PrivateRoute>
              <ReportPage />
            </PrivateRoute>
          }
        />
        {/* 학생이 수업 종료 당하면 학생에게 보여질 학생 리포트 페이지 */}
        <Route
          path="/class/:roomId/report"
          element={
            <PrivateRoute>
              <StudentReportPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
