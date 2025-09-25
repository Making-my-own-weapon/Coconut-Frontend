import http from 'k6/http';
import { sleep } from 'k6';

// 테스트 시작 시간을 기록합니다.
export function setup() {
  console.log(`테스트 시작: ${new Date().toISOString()}`);
}

// 테스트 옵션 설정
export const options = {
  // 1분간 사용자를 100명까지 늘렸다가 다시 줄임
  stages: [
    { duration: '30s', target: 100 }, // 30초 동안 100명까지 늘리고
    { duration: '30s', target: 100 }, // 100명 상태로 30초 유지
    { duration: '10s', target: 0 }, // 10초 동안 0명으로 줄임
  ],
};

export default function () {
  const baseUrl = 'http://13.209.50.28';
  //   const baseUrl = 'https://d1ps2zvz4x9igg.cloudfront.net';

  // 실제 사용자 행동 시나리오를 시뮬레이션
  const r = Math.random();

  if (r < 0.7) {
    // 70%의 사용자는 메인 페이지에 접속
    http.get(`${baseUrl}/`);
  } else if (r < 0.9) {
    // 20%의 사용자는 마이페이지에 접속
    http.get(`${baseUrl}/mypage`);
  } else {
    // 10%의 사용자는 로그인 페이지에 접속
    http.get(`${baseUrl}/login`);
  }

  // 실제 사용자인 것처럼 1초간 잠시 대기
  sleep(1);
}

// 테스트 종료 시간을 기록합니다.
export function teardown(data) {
  console.log(`테스트 종료: ${new Date().toISOString()}`);
}
