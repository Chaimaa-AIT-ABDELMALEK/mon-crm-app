import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHideEyes, setShowHideEyes] = useState(false);
  const canvasRef = useRef(null);

  // Animation des lignes de vol (identique à avant)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor(width / 15);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.3,
          color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
        });
      }
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a0f1c');
      grad.addColorStop(1, '#1a1f3a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(width * 0.1, height * 0.2);
      ctx.quadraticCurveTo(width * 0.5, height * 0.1, width * 0.8, height * 0.3);
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.6);
      ctx.quadraticCurveTo(width * 0.6, height * 0.5, width * 0.9, height * 0.8);
      ctx.stroke();

      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        null,
        { params: { username, password } }
      );
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError('❌ Identifiants invalides');
    }
    setLoading(false);
  };

  // Gestionnaire pour afficher l’emoji quand on tape dans le mot de passe
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length > 0) {
      setShowHideEyes(true);
      // Disparaît automatiquement 1 seconde après la fin de la frappe (optionnel)
      setTimeout(() => {
        if (password === e.target.value) setShowHideEyes(false);
      }, 1000);
    } else {
      setShowHideEyes(false);
    }
  };

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      <div style={styles.card}>
        <div style={styles.glow}></div>
        <div style={styles.header}>
          <div style={styles.orbit}>
            <div style={styles.ring}></div>
            <span style={styles.globeIcon}>🌍</span>
          </div>
          <h1 style={styles.title}>PM Travel CRM</h1>
          <p style={styles.subtitle}>Connexion créative</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={handlePasswordChange}
                style={styles.input}
                required
              />
              {/* Emoji qui cache ses yeux */}
              {showHideEyes && (
                <span style={styles.emojiHide}>
                  🙈
                </span>
              )}
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Connexion...' : 'Explorer →'}
          </button>
        </form>
        <div style={styles.demo}>
          ✨ <strong>admin</strong> / <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'rgba(15, 20, 35, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '32px',
    padding: '48px 40px',
    width: '90%',
    maxWidth: '460px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 30px 50px rgba(0,0,0,0.4)',
    transition: 'transform 0.3s ease',
  },
  glow: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(45deg, #ff3366, #33ffcc, #ff3366)',
    borderRadius: '34px',
    zIndex: -1,
    opacity: 0.5,
    filter: 'blur(12px)',
    animation: 'borderGlow 6s linear infinite',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  orbit: {
    position: 'relative',
    display: 'inline-block',
    width: '80px',
    height: '80px',
    marginBottom: '16px',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    animation: 'spin 10s linear infinite',
  },
  globeIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '36px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: 'white',
    margin: '0',
    letterSpacing: '-0.5px',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginTop: '8px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '60px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    transition: '0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  emojiHide: {
    position: 'absolute',
    right: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '24px',
    pointerEvents: 'none',
    animation: 'fadeIn 0.2s ease',
  },
  button: {
    width: '100%',
    background: 'linear-gradient(95deg, #ff3366, #33ffcc)',
    border: 'none',
    borderRadius: '60px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0a0f1c',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
    fontFamily: 'inherit',
  },
  error: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
    color: '#ff99aa',
    padding: '10px',
    borderRadius: '60px',
    textAlign: 'center',
    fontSize: '13px',
    marginBottom: '16px',
    border: '1px solid rgba(255,51,102,0.3)',
  },
  demo: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '20px',
  },
};

// Injecter les animations globales
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  @keyframes borderGlow {
    0% { opacity: 0.3; filter: blur(12px); }
    50% { opacity: 0.8; filter: blur(16px); }
    100% { opacity: 0.3; filter: blur(12px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-50%) scale(0.8); }
    to { opacity: 1; transform: translateY(-50%) scale(1); }
  }
  button:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(51, 255, 204, 0.5);
  }
  input:focus {
    border-color: #33ffcc;
    background-color: rgba(255,255,255,0.2);
  }
`;
document.head.appendChild(styleSheet);