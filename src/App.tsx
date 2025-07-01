import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentClassPage from './pages/StudentClassPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/editor/:editorId" element={<StudentClassPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
