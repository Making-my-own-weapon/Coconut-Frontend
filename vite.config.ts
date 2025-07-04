import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss'; // Tailwind CSS를 임포트합니다.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()], // 여기에 Tailwind CSS 플러그인을 추가합니다.
    },
  },
});
