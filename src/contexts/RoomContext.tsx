import { createContext, type ReactNode } from 'react';
import { useTeacherStore } from '../store/teacherStore';
import { type Student } from '../store/teacherStore';

// Context가 제공할 값들의 타입
interface RoomContextType {
  students: Student[];
  loading: boolean;
}

const RoomContext = createContext<RoomContextType | null>(null);

function RoomProvider({ children }: { children: ReactNode }) {
  const { students, isLoading: loading } = useTeacherStore();
  return <RoomContext.Provider value={{ students, loading }}>{children}</RoomContext.Provider>;
}

export { RoomContext, RoomProvider };
