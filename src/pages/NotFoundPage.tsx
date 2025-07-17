import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#18181b',
        color: '#fff',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        존재하지 않거나 접근할 수 없는 방입니다.
      </h1>
      <p style={{ marginBottom: '2rem' }}>방 번호를 다시 확인하거나, 홈으로 돌아가 주세요.</p>
      <button
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          background: '#27272a',
          color: '#fff',
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        홈으로 이동
      </button>
    </div>
  );
};

export default NotFoundPage;
