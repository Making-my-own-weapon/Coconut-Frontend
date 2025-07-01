import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProblemImportForm from './components/teacher-class/ProblemImportForm';
import ProblemCreateForm from './components/teacher-class/ProblemCreateForm';
import StudentClassPage from './pages/StudentClassPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/import" element={<ProblemImportForm />} />
        <Route path="/create" element={<ProblemCreateForm />} />
        <Route path="/class" element={<StudentClassPage />} />

        {/* 다른 라우트 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
