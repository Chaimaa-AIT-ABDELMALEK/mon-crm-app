import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        null,
        {
          params: {
            username,
            password
          }
        }
      );

      // Sauvegarde le token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Appelle la fonction de callback
      onLoginSuccess(response.data.user);

    } catch (err) {
      setError('❌ Identifiants invalides');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏨 PM Travel CRM</h1>
        <h2 style={styles.subtitle}>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? '⏳ Connexion...' : '✅ Login'}
          </button>
        </form>

        <p style={styles.hint}>
          Demo: username=<strong>admin</strong>, password=<strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1D9E75 0%, #0a5a3a 100%)'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    color: '#1D9E75',
    textAlign: 'center'
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: '#333',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1D9E75',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    textAlign: 'center'
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '15px',
    textAlign: 'center'
  }
};