import { useState, useEffect } from 'react';
import './index.css';
import Login from './Login';
import CRM from './CRM_Professional_Complete';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifie si un token existe déjà
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <div style={{padding: '10px', background: '#f5f5f5', textAlign: 'right', borderBottom: '1px solid #ddd'}}>
        <span style={{marginRight: '20px'}}>👤 {user?.username} ({user?.role})</span>
        <button 
          onClick={handleLogout}
          style={{padding: '5px 15px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        >
          🚪 Logout
        </button>
      </div>
      <CRM />
    </div>
  );
}