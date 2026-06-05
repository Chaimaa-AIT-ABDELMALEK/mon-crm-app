import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('api-scraping');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États pour les APIs
  const [apis, setApis] = useState({
    google_places: { enabled: false, api_key: '' },
    openai: { enabled: false, api_key: '' },
    scrapy: { enabled: false, url: '' }
  });

  // États pour SMTP
  const [smtp, setSmtp] = useState({
    provider: 'gmail',
    email: '',
    password: '',
    host: '',
    port: '',
    secure: true
  });

  // États pour IMAP
  const [imap, setImap] = useState({
    provider: 'gmail',
    email: '',
    password: '',
    host: '',
    port: '',
    secure: true,
    sync_interval: 5
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Récupère le rôle de l'utilisateur depuis le token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (e) {
        console.error('Erreur décodage token:', e);
      }
    }
  }, [token]);

  // ═══════════════════════════════════════
  // SAUVEGARDER API
  // ═══════════════════════════════════════

  const handleSaveApi = async (apiName, config) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/settings/api`,
        {
          api_name: apiName,
          config: config
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        alert(`✅ ${apiName} configuré!`);
      }
    } catch (error) {
      alert(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  // ═══════════════════════════════════════
  // SAUVEGARDER SMTP
  // ═══════════════════════════════════════

  const handleSaveSmtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/settings/smtp`,
        smtp,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('✅ SMTP configuré!');
    } catch (error) {
      alert(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  const handleTestSmtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/settings/smtp/test`,
        smtp,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('✅ Email de test envoyé!');
    } catch (error) {
      alert(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  // ═══════════════════════════════════════
  // SAUVEGARDER IMAP
  // ═══════════════════════════════════════

  const handleSaveImap = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/settings/imap`,
        imap,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('✅ IMAP configuré!');
    } catch (error) {
      alert(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  const handleSyncImap = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/settings/imap/sync`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      alert(`✅ ${data.count} nouveaux emails synchronisés!`);
    } catch (error) {
      alert(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR SETTINGS */}
      <div style={styles.sidebar}>
        <h3>⚙️ Settings</h3>
        <ul style={styles.menu}>
          <li 
            onClick={() => setActiveTab('api-scraping')}
            style={{
              ...styles.menuItem,
              ...(activeTab === 'api-scraping' ? styles.menuItemActive : {})
            }}
          >
            🔍 API Scraping
          </li>
          
          <li 
            onClick={() => setActiveTab('email-smtp')}
            style={{
              ...styles.menuItem,
              ...(activeTab === 'email-smtp' ? styles.menuItemActive : {})
            }}
          >
            📧 Email SMTP
          </li>
          
          <li 
            onClick={() => setActiveTab('email-imap')}
            style={{
              ...styles.menuItem,
              ...(activeTab === 'email-imap' ? styles.menuItemActive : {})
            }}
          >
            📨 Email IMAP
          </li>
          
          {userRole === 'admin' && (
            <li 
              onClick={() => setActiveTab('users')}
              style={{
                ...styles.menuItem,
                ...(activeTab === 'users' ? styles.menuItemActive : {})
              }}
            >
              👥 Manage Users
            </li>
          )}
        </ul>
      </div>

      {/* CONTENU */}
      <div style={styles.content}>
        {activeTab === 'api-scraping' && (
          <div>
            <h2>🔍 API Scraping Configuration</h2>

            {/* GOOGLE PLACES */}
            <div style={styles.apiCard}>
              <h3>🗺️ Google Places API</h3>
              <input 
                type="text" 
                placeholder="API Key"
                value={apis.google_places.api_key}
                onChange={(e) => setApis({
                  ...apis,
                  google_places: { ...apis.google_places, api_key: e.target.value }
                })}
                style={styles.input}
              />
              <label>
                <input 
                  type="checkbox"
                  checked={apis.google_places.enabled}
                  onChange={(e) => setApis({
                    ...apis,
                    google_places: { ...apis.google_places, enabled: e.target.checked }
                  })}
                />
                {' '} Activer Google Places
              </label>
              <button 
                onClick={() => handleSaveApi('google_places', apis.google_places)}
                style={styles.button}
                disabled={loading}
              >
                💾 Save
              </button>
            </div>

            {/* OPENAI */}
            <div style={styles.apiCard}>
              <h3>🤖 OpenAI API</h3>
              <input 
                type="password" 
                placeholder="API Key"
                value={apis.openai.api_key}
                onChange={(e) => setApis({
                  ...apis,
                  openai: { ...apis.openai, api_key: e.target.value }
                })}
                style={styles.input}
              />
              <label>
                <input 
                  type="checkbox"
                  checked={apis.openai.enabled}
                  onChange={(e) => setApis({
                    ...apis,
                    openai: { ...apis.openai, enabled: e.target.checked }
                  })}
                />
                {' '} Activer OpenAI
              </label>
              <button 
                onClick={() => handleSaveApi('openai', apis.openai)}
                style={styles.button}
                disabled={loading}
              >
                💾 Save
              </button>
            </div>
          </div>
        )}

        {activeTab === 'email-smtp' && (
          <div>
            <h2>📧 Configuration Email SMTP</h2>

            <div style={styles.section}>
              <label>Provider:</label>
              <select 
                value={smtp.provider} 
                onChange={(e) => setSmtp({...smtp, provider: e.target.value})}
                style={styles.input}
              >
                <option value="gmail">Gmail</option>
                <option value="hostinger">Hostinger</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div style={styles.section}>
              <label>Email:</label>
              <input 
                type="email"
                placeholder="contact@pmtravel.ma"
                value={smtp.email}
                onChange={(e) => setSmtp({...smtp, email: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.section}>
              <label>Password:</label>
              <input 
                type="password"
                value={smtp.password}
                onChange={(e) => setSmtp({...smtp, password: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={handleTestSmtp} style={{...styles.button, backgroundColor: '#ff9800'}} disabled={loading}>
                🧪 Test Email
              </button>
              <button onClick={handleSaveSmtp} style={styles.button} disabled={loading}>
                💾 Save SMTP
              </button>
            </div>
          </div>
        )}

        {activeTab === 'email-imap' && (
          <div>
            <h2>📨 Configuration Email IMAP</h2>

            <div style={styles.section}>
              <label>Provider:</label>
              <select 
                value={imap.provider} 
                onChange={(e) => setImap({...imap, provider: e.target.value})}
                style={styles.input}
              >
                <option value="gmail">Gmail</option>
                <option value="hostinger">Hostinger</option>
              </select>
            </div>

            <div style={styles.section}>
              <label>Email:</label>
              <input 
                type="email"
                value={imap.email}
                onChange={(e) => setImap({...imap, email: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.section}>
              <label>Password:</label>
              <input 
                type="password"
                value={imap.password}
                onChange={(e) => setImap({...imap, password: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.section}>
              <label>Sync Interval (minutes):</label>
              <input 
                type="number"
                value={imap.sync_interval}
                onChange={(e) => setImap({...imap, sync_interval: parseInt(e.target.value)})}
                style={styles.input}
                min="1"
                max="60"
              />
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={handleSyncImap} style={{...styles.button, backgroundColor: '#ff9800'}} disabled={loading}>
                🔄 Sync Now
              </button>
              <button onClick={handleSaveImap} style={styles.button} disabled={loading}>
                💾 Save IMAP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '20px',
    height: '100%'
  },
  sidebar: {
    width: '200px',
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px'
  },
  menu: {
    listStyle: 'none',
    padding: 0
  },
  menuItem: {
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginBottom: '5px'
  },
  menuItemActive: {
    background: '#1D9E75',
    color: 'white'
  },
  content: {
    flex: 1,
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    overflowY: 'auto'
  },
  apiCard: {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  section: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  button: {
    padding: '10px 20px',
    background: '#1D9E75',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  }
};