// 로그인 API 통신 함수 분리
export async function login(email: string, password: string) {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  return res.json(); // { accessToken, refreshToken }
}
