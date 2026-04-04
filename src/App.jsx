import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';
import AdminPanel from './pages/AdminPanel.jsx';
import EntrepreneurPanel from './pages/EntrepreneurPanel.jsx';
import Feedback from './pages/Feedback.jsx';
import Home from './pages/Home.jsx';
import Interaction from './pages/Interaction.jsx';
import Login from './pages/Login.jsx';
import MicrostoreDetail from './pages/MicrostoreDetail.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calificaciones" element={<Feedback />} />
        <Route path="/interaccion" element={<Interaction />} />
        <Route path="/login" element={<Login />} />
        <Route path="/microtiendas/:id" element={<MicrostoreDetail />} />
        <Route path="/panel-admin" element={<AdminPanel />} />
        <Route path="/panel-emprendedor" element={<EntrepreneurPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
