import Swal from 'sweetalert2';

// 토스트 알림 (우상단에 나타나는 작은 알림)
export const showToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  theme: 'light' | 'dark' = 'dark', // 기본값: 다크
) => {
  const isLight = theme === 'light';
  Swal.fire({
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    toast: true,
    background: isLight ? '#fff' : '#1e293b',
    color: isLight ? '#222' : '#f1f5f9',
    customClass: {
      popup: 'swal2-toast-custom',
    },
  });
};

// 성공 알림
export const showSuccess = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: '확인',
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#059669', // green-600
  });
};

// 에러 알림
export const showError = (title: string, message?: string) => {
  Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: '확인',
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#dc2626', // red-600
  });
};

// 확인 알림 (사용자 확인 필요)
export const showConfirm = (
  title: string,
  message: string,
  theme: 'light' | 'dark' = 'dark', // 기본값: 다크
): Promise<boolean> => {
  const isLight = theme === 'light';
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    background: isLight ? '#fff' : '#1e293b',
    color: isLight ? '#222' : '#f1f5f9',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#6b7280',
  }).then((result: any) => {
    return result.isConfirmed;
  });
};

// 로딩 알림
export const showLoading = (message: string = '처리 중...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    background: '#1e293b',
    color: '#f1f5f9',
  });
};

// 로딩 닫기
export const closeLoading = () => {
  Swal.close();
};
