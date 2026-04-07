import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';
import RouteErrorBoundary from './components/RouteErrorBoundary.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calificaciones" element={<Feedback />} />
        <Route path="/interaccion" element={<Interaction />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/microtiendas/:id"
          element={
            <RouteErrorBoundary title="No pudimos abrir este espacio">
              <MicrostoreDetail />
            </RouteErrorBoundary>
          }
        />
        <Route path="/panel-admin" element={<AdminPanel />} />
        <Route path="/panel-emprendedor" element={<EntrepreneurPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
