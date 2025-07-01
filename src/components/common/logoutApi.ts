// 로그아웃 API 요청 함수
export async function logout(accessToken: string) {
  return fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
