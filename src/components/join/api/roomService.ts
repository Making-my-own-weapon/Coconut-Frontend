// // '수업 생성' API 함수
// export const createRoomAPI = async ({
//   title,
//   maxParticipants,
// }: {
//   title: string;
//   maxParticipants: number;
// }) => {
//   // 실제 API 호출 예시 (POST)
//   const response = await fetch(`/api/room/create`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ title, maxParticipants }),
//   });
//   if (!response.ok) throw new Error('생성 실패');
//   return response.json();
// };

// // '수업 참여' API 함수
// export const joinRoomAPI = async (inviteCode: string) => {
//   // 실제 API 호출 예시 (POST)
//   const response = await fetch(`/api/room/join`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ inviteCode }),
//   });
//   if (!response.ok) throw new Error('참여 실패');
//   return response.json();
// };

export const createRoomAPI = async ({
  title,
  description,
  maxParticipants,
  userId,
}: {
  title: string;
  description: string;
  maxParticipants: number;
  userId: number;
}) => {
  const response = await fetch('http://localhost:3001/api/v1/rooms/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': String(userId),
    },
    body: JSON.stringify({ title, description, maxParticipants }),
  });
  if (!response.ok) throw new Error('생성 실패');
  return response.json();
};

// 방 참가
export const joinRoomAPI = async (inviteCode: string, userId: number) => {
  const response = await fetch('http://localhost:3001/api/v1/rooms/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': String(userId),
    },
    body: JSON.stringify({ inviteCode }),
  });
  if (!response.ok) throw new Error('참여 실패');
  return response.json();
};
