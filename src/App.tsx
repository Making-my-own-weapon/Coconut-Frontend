import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProblemImportForm from './components/teacher-class/ProblemImportForm';
import ProblemCreateForm from './components/teacher-class/ProblemCreateForm';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JoinPage from './pages/JoinPage';
import StudentClassPage from './pages/StudentClassPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/import" element={<ProblemImportForm />} />
        <Route path="/create" element={<ProblemCreateForm />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/class/:roomId" element={<StudentClassPage />} />
        {/* 다른 라우트 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
