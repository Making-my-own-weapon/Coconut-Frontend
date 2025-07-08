import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SVGLine {
  points: [number, number][];
  color: string;
}

interface SVGState {
  lines: SVGLine[];
  socket: Socket | null;
  roomId: string | null;
  userId: string | null;
  userType: 'teacher' | 'student' | null;
  isConnected: boolean;

  setLines: (lines: SVGLine[]) => void;
  addLine: (line: SVGLine) => void;
  clearLines: () => void;
  connectToRoom: (roomId: string, userId: string, userType: 'teacher' | 'student') => void;
  leaveRoom: () => void;
}

export const useSVGStore = create<SVGState>((set, get) => ({
  lines: [],
  socket: null,
  roomId: null,
  userId: null,
  userType: null,
  isConnected: false,

  setLines: (lines) => set({ lines }),

  addLine: (line) => {
    const { lines, socket, roomId, userType } = get();
    // 선생님만 그림을 그릴 수 있음
    if (userType !== 'teacher') return;
    const newLines = [...lines, line];
    set({ lines: newLines });
    // 실시간으로 다른 사용자에게 전송
    if (socket && roomId) {
      socket.emit('updateSVG', {
        roomId,
        lines: newLines,
      });
    }
  },

  clearLines: () => {
    const { socket, roomId, userType } = get();
    if (userType !== 'teacher') return;
    set({ lines: [] });
    if (socket && roomId) {
      socket.emit('clearSVG', roomId);
    }
  },

  connectToRoom: (roomId, userId, userType) => {
    const { socket: existingSocket } = get();

    // 기존 연결이 있으면 먼저 정리
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io('http://localhost:3001');
    socket.on('connect', () => {
      set({ isConnected: true });
      socket.emit('joinRoom', { roomId, userId, userType });
    });
    socket.on('disconnect', () => {
      set({ isConnected: false });
    });
    socket.on('svgData', (data: { lines: SVGLine[] }) => {
      set({ lines: data.lines || [] });
    });
    socket.on('svgCleared', () => {
      set({ lines: [] });
    });
    set({ socket, roomId, userId, userType });
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    set({
      socket: null,
      roomId: null,
      userId: null,
      userType: null,
      isConnected: false,
      lines: [],
    });
  },
}));
