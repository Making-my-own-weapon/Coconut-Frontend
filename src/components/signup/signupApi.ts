// 회원가입 API
export async function signup(name: string, email: string, password: string) {
  const response = await fetch('/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (response.status === 201) {
    return await response.json(); // { userId, email }
  } else if (response.status === 409) {
    throw new Error('이미 존재하는 이메일입니다.');
  } else {
    const error = await response.text();
    throw new Error(error || '회원가입에 실패했습니다.');
  }
}
