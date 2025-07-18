import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import NotFoundPage from './pages/NotFoundPage';

// --- 컴포넌트 import ---
import PrivateRoute from './components/PrivateRoute';
import { useTeacherStore } from './store/teacherStore';
import { useStudentStore } from './store/studentStore';

import './App.css';

function App() {
  const { isLoggedIn, silentRefresh, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  // const navigate = useNavigate(); // 제거
  const { fetchRoomDetails: fetchTeacherRoom } = useTeacherStore();

  useEffect(() => {
    const initializeApp = async () => {
      await silentRefresh();
      setIsLoading(false);
    };
    initializeApp();
  }, [silentRefresh]);

  // 자동 라우팅(useEffect)
  useEffect(() => {
    const autoRoute = async () => {
      if (!user) return;
      if (user.roomId == null) {
        // 방이 없으면 무조건 join으로
        if (window.location.pathname !== '/join') {
          window.location.replace('/join');
        }
        return;
      }
      // 방이 있으면 방 정보 fetch 후 분기
      try {
        await fetchTeacherRoom(String(user.roomId));
        const room = useTeacherStore.getState().currentRoom;
        if (room && room.roomId && room.participants) {
          const creator = room.participants.find(
            (p) => p.userId === user.id && p.name === user.name,
          );
          if (creator && user.id === room.participants[0].userId) {
            if (window.location.pathname !== `/room/${user.roomId}`) {
              window.location.replace(`/room/${user.roomId}`);
            }
          } else {
            if (window.location.pathname !== `/class/${user.roomId}`) {
              window.location.replace(`/class/${user.roomId}`);
            }
          }
        }
      } catch (e) {
        // 방 정보 조회 실패 시 무시
      }
    };
    autoRoute();
  }, [user, fetchTeacherRoom]);

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
        {/* NotFoundPage: 위에 해당하지 않는 모든 경로 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
