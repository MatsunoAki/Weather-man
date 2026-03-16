import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Add the wildcard /* to allow nested routing */}
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;