import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProblemImportForm from './components/teacher-class/ProblemImportForm';
import ProblemCreateForm from './components/teacher-class/ProblemCreateForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="/teacher-class" element={<TeacherClassPage />} />*/}
        <Route path="/teacher-class/:roomId/import" element={<ProblemImportForm />} />
        <Route path="/teacher-class/:roomId/create" element={<ProblemCreateForm />} />
        {/* 다른 라우트 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
