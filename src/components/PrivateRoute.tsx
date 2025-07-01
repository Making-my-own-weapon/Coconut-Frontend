import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/authStore';

const PrivateRoute = ({ children }: React.PropsWithChildren) => {
  // Zustand 스토어에서 로그인 상태를 가져옵니다.
  const { isLoggedIn } = useAuthStore();

  // 로그인 상태이면 요청된 페이지(children)를 보여주고,
  // 로그아웃 상태이면 로그인 페이지로 강제 이동시킵니다.
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
