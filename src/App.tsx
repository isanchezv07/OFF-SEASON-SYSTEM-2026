import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ScoreController from './components/roles/ADMIN/ScoreController';
import PrivateRoute from './components/PrivateRoute';
import PresentationScreen from './components/animations/PresentacionScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route
          path="/control"
          element={
            <PrivateRoute>
              <ScoreController />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/presentation" element={<PresentationScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;