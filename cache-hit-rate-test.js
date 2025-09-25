import http from 'k6/http';
import { sleep } from 'k6';

// 테스트 시작 시간
export function setup() {
  console.log(`[Cache Hit Rate Test] 테스트 시작: ${new Date().toISOString()}`);
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

// 반복적으로 요청할 정적 파일 목록
const staticAssets = ['/coconut-icon.svg', '/vite.svg', '/pyodide-worker.js'];

export default function () {
  //   캐시 히트율 측정을 위한 CloudFront 주소
  const baseUrl = 'https://d1ps2zvz4x9igg.cloudfront.net';

  // k6 실험용 모듈 대신 기본 JS를 사용하여 목록에서 무작위로 정적 파일을 선택
  const assetUrl = staticAssets[Math.floor(Math.random() * staticAssets.length)];
  http.get(`${baseUrl}${assetUrl}`);

  // 실제 사용자인 것처럼 1초간 잠시 대기
  sleep(1);
}

// 테스트 종료 시간
export function teardown(data) {
  console.log(`[Cache Hit Rate Test] 테스트 종료: ${new Date().toISOString()}`);
}
