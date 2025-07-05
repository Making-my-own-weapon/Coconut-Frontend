import StudentGridView from './StudentGridView';
import { useRoom } from '../../../hooks/useRoom';
import { type Student } from '../../../store/teacherStore';

function StudentDashboard() {
  const { students, loading } = useRoom();
  const onlineCount = students.filter((student: Student) => student?.isOnline).length;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">실시간 학생 현황</h2>
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span>
              온라인: <span className="font-semibold text-white">{onlineCount}</span> /{' '}
              {students.length} 명
            </span>
          </div>
        )}
      </div>
      <StudentGridView students={students} />
    </div>
  );
}

export default StudentDashboard;
