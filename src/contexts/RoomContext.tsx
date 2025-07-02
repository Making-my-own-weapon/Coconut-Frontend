import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { mockStudentData } from '../mocks/data';

// 1. Student 타입을 여기서 직접 정의하고 다른 파일에서 쓸 수 있도록 export 합니다.
export interface Student {
  id: number;
  userName: string;
  progress: number;
  timeComplexity: string;
  spaceComplexity: string;
  testsPassed: number;
  totalTests: number;
  isOnline: boolean;
}

// Context가 제공할 값들의 타입
interface RoomContextType {
  students: Student[];
  loading: boolean;
}

const RoomContext = createContext<RoomContextType | null>(null);

function RoomProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 가짜 API 로딩을 시뮬레이션합니다. (1초 후 데이터 로드)
    const timer = setTimeout(() => {
      setStudents(mockStudentData);
      setLoading(false);
    }, 1000);

    // 컴포넌트가 사라질 때 타이머를 정리합니다.
    return () => clearTimeout(timer);
  }, []);

  return <RoomContext.Provider value={{ students, loading }}>{children}</RoomContext.Provider>;
}

export { RoomContext, RoomProvider };
