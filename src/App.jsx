import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Overview from './pages/Overview.jsx';
import Discovery from './pages/Discovery.jsx';
import Retention from './pages/Retention.jsx';
import Moderation from './pages/Moderation.jsx';
import Breakout from './pages/Breakout.jsx';
import Creators from './pages/Creators.jsx';
import Teardown from './pages/Teardown.jsx';

const TABS = [
  ['/overview', 'Overview'],
  ['/discover', 'Discovery'],
  ['/retention', 'Retention'],
  ['/moderation', 'Moderation'],
  ['/breakout', 'Breakout Signals'],
  ['/creators', 'Creators'],
  ['/teardown', 'Product Teardown'],
];

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('pulse_dark') === '1');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('pulse_dark', dark ? '1' : '0');
  }, [dark]);

  return (
    <div className="app">
      <nav className="topnav">
        <span className="brand">Pulse<span className="dot">.</span></span>
        {TABS.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}>
            {label}
          </NavLink>
        ))}
        <span className="spacer" />
        <button className="iconbtn" onClick={() => setDark((d) => !d)}>{dark ? '☀ Light' : '☾ Dark'}</button>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/discover" element={<Discovery />} />
        <Route path="/retention" element={<Retention />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/breakout" element={<Breakout />} />
        <Route path="/creators" element={<Creators />} />
        <Route path="/teardown" element={<Teardown />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </div>
  );
}
