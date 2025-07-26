import React, { useState } from 'react';
import MyPageBackground from '../components/mypage/MyPageBackground';
import { MyPageLeftSide } from '../components/mypage';
import AccountManagementView from '../components/mypage/AccountManagementView';
import MyPageReportView from '../components/mypage/MyPageReportView';
import ProblemManagementView from '../components/mypage/ProblemManagementView';
import { useAuthStore } from '../store/authStore';

const MyPage: React.FC = () => {
  // 1. 어떤 탭이 활성화되었는지 관리하는 상태 (기본값: 'account-management')
  const [activeTab, setActiveTab] = useState('report');
  const { user, deleteAccount, changePassword } = useAuthStore();

  // 2. 오른쪽 패널에 보여줄 컨텐츠를 결정하는 함수
  const renderRightPanel = () => {
    switch (activeTab) {
      case 'report':
        return <MyPageReportView />;
      case 'problem-management':
        return <ProblemManagementView />;
      case 'account-management':
        return (
          <AccountManagementView
            userName={user?.name}
            userEmail={user?.email}
            lastPasswordUpdate={
              user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('ko-KR') : undefined
            }
            onPasswordChange={changePassword}
            onAccountDeletion={deleteAccount}
          />
        );
      default:
        return <MyPageReportView />;
    }
  };

  return (
    <MyPageBackground>
      <div className="mt-8 flex flex-row gap-9 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <MyPageLeftSide activeItem={activeTab} onItemClick={(key) => setActiveTab(key)} />

        {/* 3. activeTab 상태에 따라 다른 뷰를 렌더링합니다. */}
        {renderRightPanel()}
      </div>
    </MyPageBackground>
  );
};

export default MyPage;
