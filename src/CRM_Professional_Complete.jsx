import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  // Dashboard
  LayoutDashboard, Users, Handshake, DollarSign, TrendingUp, 
  UserCircle,LogOut,
  ClipboardList, Megaphone, BarChart3, Wrench, Mail, Settings,
  // Statut
  CheckCircle, XCircle, AlertTriangle,
  // Actions
  Plus, Trash2, Pencil, Mail as MailIcon, UserPlus,
  // Contact
  MapPin, Building2, Phone, AtSign, Check, X,
  // Scraping
  Search, Globe, RefreshCw, History,
  // Emails
  Inbox, MessageSquare, Eye, Reply, Clock,
  // Menu
  Menu, X as XIcon, Home, Users as UsersIcon, 
  Activity, PieChart, Cog,
  // Additional icons for emoji replacements
  StopCircle, Loader2, Send, Download, Filter, Map,
  Bot, Camera, Smartphone, Star, Zap, Bike, Truck, Plane,
  Package, Hotel, Compass, Smile, ChevronLeft, ChevronRight,
  MailOpen, MousePointer, ArrowLeft, Inbox as InboxIcon,
  FlaskConical, Save, Wifi, WifiOff, Plug, Calendar,
  Sparkles, Image, FileText, List, RotateCcw, ArrowUpDown,
  CircleAlert, Info, CircleCheck, Slash,
  // Imports supplémentaires (UNIQUEMENT CEUX QUI MANQUENT)
  Building,      // Hôtel - PAS encore importé
  Bus,           // Transport touristique - PAS encore importé
  Backpack,      // Tour Operator - PAS encore importé
  Lock,          // Login - PAS encore importé
  // AJOUTER CES IMPORTS MANQUANTS :
  ArrowRight,    // Ligne 911
  Rocket,        // Ligne 1658
  Sun,           // Ligne 1715
  Mountain,      // Ligne 1717
  Utensils,      // Ligne 1718
  User,          // Ligne 2270
  Circle         // Pour le statut Actif
} from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

// ===== COMPOSANT SCRAPING STATUS CARD =====
const ScrapingStatusCard = ({ title, description, isRunning, found, skipped, statusMsg, statusKind, recent, onLaunch, onCancel, isDisabled, buttonLabel }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="flex gap-2 items-center">
        {isRunning && (
          <button onClick={onCancel} className="px-5 py-3 rounded-lg text-white font-medium transition whitespace-nowrap bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <StopCircle className="w-4 h-4" />
            Arrêter
          </button>
        )}
        <button
          onClick={onLaunch}
          disabled={isRunning || isDisabled}
          className={`px-6 py-3 rounded-lg text-white font-medium transition whitespace-nowrap flex items-center gap-2 ${(isRunning || isDisabled) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              En cours...
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>

    {/* Affichage du statut en temps réel */}
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-600">
        <strong>État:</strong> {isRunning ? (
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> En cours</span>
        ) : (statusKind === 'completed' ? (
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Terminé</span>
        ) : (statusKind === 'error' ? (
          <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Erreur</span>
        ) : (
          <span className="flex items-center gap-1"><StopCircle className="w-3 h-3" /> Arrêté</span>
        )))}
        {' | '}
        <strong>Trouvés:</strong> {found} {' | '} <strong>Doublons:</strong> {skipped}
      </p>
    </div>

    {isRunning && (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-semibold text-blue-600">{found} nouveaux · {skipped} doublons</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    )}

    {statusMsg && (
      <div className={`p-4 rounded-lg mb-4 font-medium flex items-center gap-2 ${statusKind === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' : statusKind === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : statusKind === 'cancelled' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
        {statusKind === 'completed' && <CheckCircle className="w-4 h-4" />}
        {statusKind === 'error' && <XCircle className="w-4 h-4" />}
        {statusKind === 'cancelled' && <AlertTriangle className="w-4 h-4" />}
        {statusKind !== 'completed' && statusKind !== 'error' && statusKind !== 'cancelled' && <Search className="w-4 h-4" />}
        <span>{statusMsg}</span>
      </div>
    )}

    {recent && recent.length > 0 && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Inbox className="w-4 h-4" />
          Prospects trouvés ({recent.length}):
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recent.map((p, i) => (
            <div key={i} className="text-sm bg-white p-2 rounded border border-gray-200">
              <p className="font-medium text-gray-800">{p.nom || p.name}</p>
              {(p.email) && <p className="text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</p>}
              <p className="text-gray-500 text-xs">{p.ville || p.city}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ===== MODULES =====
const Dashboard = ({ stats, opportunities, activities }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard title="Total Contacts" value={stats.totalContacts} icon={<Users className="w-8 h-8" />} trend="+5%" color="from-blue-500 to-blue-600" />
      <StatCard title="Deals Actifs" value={stats.activeDeals} icon={<Handshake className="w-8 h-8" />} trend="+2" color="from-green-500 to-green-600" />
      <StatCard title="Revenu Attendu" value={`${stats.revenueExpected.toLocaleString()}€`} icon={<DollarSign className="w-8 h-8" />} trend="+12%" color="from-purple-500 to-purple-600" />
      <StatCard title="Taux Conversion" value={`${stats.conversionRate}%`} icon={<TrendingUp className="w-8 h-8" />} trend="+3%" color="from-orange-500 to-orange-600" />
      <StatCard title="Tâches en attente" value={stats.tasksThisWeek} icon={<ClipboardList className="w-8 h-8" />} trend={stats.tasksThisWeek > 0 ? "À faire" : "Tout bon ✓"} color="from-red-500 to-red-600" />
      <StatCard title="Campagnes Actives" value={stats.activeCampaigns} icon={<Megaphone className="w-8 h-8" />} trend="En cours" color="from-indigo-500 to-indigo-600" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Pipeline de Vente" data={opportunities} type="pipeline" />
      <ChartCard title="Activités Récentes" data={activities.slice(0, 5)} type="activities" />
    </div>
  </div>
);

const StatCard = ({ title, value, icon, trend, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className="text-xs opacity-75 mt-2">{trend}</p>
      </div>
      <div className="text-4xl opacity-90">{icon}</div>
    </div>
  </div>
);

const ChartCard = ({ title, data, type }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {type === 'pipeline' && (
      <div className="space-y-3">
        {['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage, i) => {
          const count = data.filter(o => o.stage === stage).length;
          const amount = data.filter(o => o.stage === stage).reduce((acc, o) => acc + Number(o.amount || 0), 0);
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{stage}</span>
                <span className="text-gray-600">{amount.toLocaleString()}€</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: data.length ? `${(count / data.length) * 100}%` : '0%' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    )}
    {type === 'activities' && (
      <div className="space-y-2">
        {data.length === 0 && <p className="text-sm text-gray-400 italic">Aucune activité récente</p>}
        {data.map((activity, i) => (
          <div key={activity.id || i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <div className={`w-3 h-3 rounded-full ${activity.type === 'Appel' ? 'bg-blue-500' : activity.type === 'Email' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.contact} • {activity.date}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ContactsModule = ({ contacts, setContacts, newContact, editingContact, showContactForm, handleContactNameChange, handleContactEmailChange, handleContactPhoneChange, handleContactCityChange, handleContactSecteurChange, handleContactStatusChange, handleAddContact, handleEditContact, handleDeleteContact, setShowContactForm, setEditingContact, setNewContact }) => {
  const [searchText, setSearchText] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  // TYPES D'ÉTABLISSEMENT
  const ESTABLISHMENT_TYPES = {
    'hotel': {
      name: 'Hôtel',
      icon: Building,
      badge: 'bg-blue-100 text-blue-800',
      border: 'border-blue-300'
    },
    'riad': {
      name: 'Riad',
      icon: Home,
      badge: 'bg-amber-100 text-amber-800',
      border: 'border-amber-300'
    },
    'transport touristique': {
      name: 'Transport touristique',
      icon: Bus,
      badge: 'bg-green-100 text-green-800',
      border: 'border-green-300'
    },
    'agence de voyage': {
      name: 'Agence de voyage',
      icon: Plane,
      badge: 'bg-purple-100 text-purple-800',
      border: 'border-purple-300'
    },
    'tour operator': {
      name: 'Tour Operator',
      icon: Backpack,
      badge: 'bg-orange-100 text-orange-800',
      border: 'border-orange-300'
    }
  };

  const detectTypeFromName = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('riad')) return 'riad';
    if (lowerName.includes('hotel') || lowerName.includes('hilton') || lowerName.includes('marriott') ||
        lowerName.includes('sheraton') || lowerName.includes('sofitel') || lowerName.includes('spa') ||
        lowerName.includes('resort') || lowerName.includes('palace') || lowerName.includes('holiday')) {
      return 'hotel';
    }
    if (lowerName.includes('tour operator') || lowerName.includes('operator')) return 'tour operator';
    if (lowerName.includes('travel agency') || (lowerName.includes('travel') && !lowerName.includes('tour'))) {
      return 'agence de voyage';
    }
    if (lowerName.includes('tour') || lowerName.includes('tours') || lowerName.includes('excursion') ||
        lowerName.includes('safari') || lowerName.includes('transfer') || lowerName.includes('adventure')) {
      return 'transport touristique';
    }
    return '';
  };

  const getSecteurInfo = (secteur) => {
    if (!secteur) {
      return {
        name: 'Non défini',
        icon: MapPin,
        badge: 'bg-gray-100 text-gray-800',
        border: 'border-gray-300'
      };
    }
    const normalized = secteur.toLowerCase().trim();
    return ESTABLISHMENT_TYPES[normalized] || {
      name: secteur,
      icon: MapPin,
      badge: 'bg-gray-100 text-gray-800',
      border: 'border-gray-300'
    };
  };

  const getFilteredContacts = () => {
    return contacts.filter(contact => {
      if (searchText) {
        const search = searchText.toLowerCase();
        if (!contact.name.toLowerCase().includes(search) &&
            !contact.email.toLowerCase().includes(search) &&
            !(contact.source || '').toLowerCase().includes(search)) return false;
      }
      if (filterCity && contact.city !== filterCity) return false;
      if (filterSecteur) {
        const contactSecteurNorm = (contact.secteur || '').toLowerCase();
        const filterSecteurNorm = filterSecteur.toLowerCase();
        if (contactSecteurNorm !== filterSecteurNorm) return false;
      }
      return true;
    });
  };

  const filteredContacts = getFilteredContacts();
  const availableCities = [...new Set(contacts.map(c => c.city).filter(Boolean))].sort();
  const secteurs = [...new Set(contacts.map(c => c.secteur).filter(Boolean))].sort();

  // ===================== GESTION DE LA SÉLECTION =====================
  const toggleSelect = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleSendEmails = async () => {
    if (selectedContacts.length === 0) {
      alert("Sélectionnez au moins un contact");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${API_URL}/campagnes/envoyer-selection`,
        { contact_ids: selectedContacts },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (res.data.echecs > 0 && res.data.envoyes === 0) {
        alert(`❌ Échec total : aucun email envoyé. Vérifiez la configuration SendGrid.`);
      } else if (res.data.echecs > 0) {
        alert(`✅ Partiellement réussi : ${res.data.envoyes} envoyé(s), ${res.data.echecs} échec(s).`);
      } else {
        alert(`✅ Succès : ${res.data.envoyes} email(s) envoyé(s) !`);
      }
      setSelectedContacts([]);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l'envoi (problème réseau ou serveur).");
    }
  };

  // ===================================================================

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && contacts.length === 0) {
      axios.get('http://127.0.0.1:8000/prospects', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        setContacts(res.data.map(p => ({
          id: p.id,
          name: p.nom,
          email: p.email,
          phone: p.telephone,
          city: p.ville,
          secteur: p.secteur || detectTypeFromName(p.nom),
          status: p.statut || 'Active'
        })));
      }).catch(err => console.error('Erreur chargement:', err));
    }
  }, [contacts.length, setContacts]);

  const handleResetFilters = () => {
    setSearchText('');
    setFilterCity('');
    setFilterSecteur('');
  };

  const hasActiveFilters = searchText || filterCity || filterSecteur;

  return (
    <div className="space-y-5">
      <style>{`@keyframes crm-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.crm-spin{animation:crm-spin 1s linear infinite;display:inline-block}`}</style>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Contacts</h2>
        <div className="flex gap-2 flex-wrap">
          {selectedContacts.length > 0 && (
            <button
              onClick={handleSendEmails}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Envoyer email ({selectedContacts.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowContactForm(true);
              setEditingContact(null);
              setNewContact({ name: '', email: '', phone: '', secteur: '', city: '', status: 'Active' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Contact
          </button>
        </div>
      </div>

      {showContactForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">{editingContact ? 'Modifier le Contact' : 'Ajouter un Contact'}</h3>
          <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom" value={newContact.name} onChange={handleContactNameChange} className="p-2 border border-gray-300 rounded-lg" required />
            <input type="email" placeholder="Email" value={newContact.email} onChange={handleContactEmailChange} className="p-2 border border-gray-300 rounded-lg" required />
            <input type="tel" placeholder="Téléphone" value={newContact.phone} onChange={handleContactPhoneChange} className="p-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Ville" value={newContact.city} onChange={handleContactCityChange} className="p-2 border border-gray-300 rounded-lg" />
            <select value={newContact.secteur} onChange={handleContactSecteurChange} className="p-2 border border-gray-300 rounded-lg">
              <option value="">-- Secteur --</option>
              {Object.entries(ESTABLISHMENT_TYPES).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
            <select value={newContact.status} onChange={handleContactStatusChange} className="p-2 border border-gray-300 rounded-lg">
              <option value="Active">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">
                {editingContact ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowContactForm(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Rechercher un contact
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Recherchez par nom ou email…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Filtrer par ville
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Toutes les villes ({availableCities.length})</option>
                {availableCities.map(city => {
                  const count = contacts.filter(c => c.city === city).length;
                  return <option key={city} value={city}>{city} ({count})</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Filtrer par secteur
              </label>
              <select
                value={filterSecteur}
                onChange={(e) => setFilterSecteur(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Tous les secteurs ({contacts.length})</option>
                {secteurs.map(secteur => {
                  const info = getSecteurInfo(secteur);
                  const count = contacts.filter(c => c.secteur === secteur).length;
                  return (
                    <option key={secteur} value={secteur}>
                      {info.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filtres:
                </strong>
                {searchText && ` "${searchText}"`}
                {filterCity && ` • ${filterCity}`}
                {filterSecteur && ` • ${getSecteurInfo(filterSecteur).name}`}
              </p>
              <button
                onClick={handleResetFilters}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {hasActiveFilters ? <Search className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
            {hasActiveFilters
              ? `${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}`
              : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} au total`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <input type="checkbox" onChange={selectAll} checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0} />
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">SECTEUR</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ville</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Score</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Source</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => {
                const secteurInfo = getSecteurInfo(contact.secteur);
                return (
                  <tr key={contact.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={() => toggleSelect(contact.id)} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{contact.name}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <div className={`px-4 py-3 rounded-lg text-sm font-bold inline-flex items-center gap-2 ${secteurInfo.badge} border-2 ${secteurInfo.border}`}>
                        {React.createElement(secteurInfo.icon, { className: "w-5 h-5" })}
                        <span>{secteurInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{contact.city}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold
                        ${contact.score >= 90 ? 'bg-green-100 text-green-800' :
                          contact.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          contact.score >= 50 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-600'}
                      `}>
                        {contact.score !== undefined && contact.score !== null ? contact.score : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                        <MapPin className="w-3 h-3" /> {contact.source || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {contact.status === 'Active' ? <><Circle className="w-3 h-3 fill-green-500 text-green-500 inline" /> Actif</> : contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button onClick={() => handleEditContact(contact)} className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1">
                        <Pencil className="w-3 h-3" />Modifier
                      </button>
                      <button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-800 font-bold inline-flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OpportunitiesModule = ({ opportunities, newOpportunity, editingOpportunity, showOpportunityForm, handleOpportunityTitleChange, handleOpportunityCompanyChange, handleOpportunityAmountChange, handleOpportunityExpectedCloseChange, handleOpportunityStageChange, handleOpportunityProbabilityChange, handleAddOpportunity, handleEditOpportunity, handleDeleteOpportunity, setShowOpportunityForm, setEditingOpportunity, setNewOpportunity }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Pipeline de Vente</h2>
      <button onClick={() => { setShowOpportunityForm(true); setEditingOpportunity(null); setNewOpportunity({ title: '', company: '', amount: '', stage: 'Prospection', probability: 50, expectedClose: '' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Nouvelle Opportunité
      </button>
    </div>
    {showOpportunityForm && (<div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold mb-4">{editingOpportunity ? 'Modifier l\'Opportunité' : 'Nouvelle Opportunité'}</h3><form onSubmit={handleAddOpportunity} className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Titre" value={newOpportunity.title} onChange={handleOpportunityTitleChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="text" placeholder="Entreprise" value={newOpportunity.company} onChange={handleOpportunityCompanyChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="number" placeholder="Montant (€)" value={newOpportunity.amount} onChange={handleOpportunityAmountChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="date" value={newOpportunity.expectedClose} onChange={handleOpportunityExpectedCloseChange} className="p-2 border border-gray-300 rounded-lg" /><select value={newOpportunity.stage} onChange={handleOpportunityStageChange} className="p-2 border border-gray-300 rounded-lg"><option>Prospection</option><option>Négociation</option><option>Proposition</option><option>Gagné</option></select><div className="flex flex-col gap-1"><label className="text-sm text-gray-600">Probabilité : {newOpportunity.probability}%</label><input type="range" min="0" max="100" value={newOpportunity.probability} onChange={handleOpportunityProbabilityChange} className="w-full" /></div><div className="md:col-span-2 flex gap-2"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingOpportunity ? 'Mettre à jour' : 'Ajouter'}</button><button type="button" onClick={() => { setShowOpportunityForm(false); setEditingOpportunity(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button></div></form></div>)}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage) => { const stageOpps = opportunities.filter(o => o.stage === stage); const total = stageOpps.reduce((acc, o) => acc + Number(o.amount || 0), 0); return (<div key={stage} className="bg-white rounded-lg shadow-md p-4"><h3 className="font-semibold text-gray-800 mb-2">{stage}</h3><p className="text-2xl font-bold text-blue-600">{total.toLocaleString()}€</p><p className="text-sm text-gray-500 mt-1">{stageOpps.length} affaires</p></div>); })}
    </div>
  </div>
);

const ActivitiesModule = ({ activities, newActivity, editingActivity, showActivityForm, handleActivityTypeChange, handleActivityContactChange, handleActivityDescriptionChange, handleActivityDateChange, handleActivityResultChange, handleAddActivity, handleEditActivity, handleDeleteActivity, setShowActivityForm, setEditingActivity, setNewActivity }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Activités</h2>
      <button onClick={() => { setShowActivityForm(true); setEditingActivity(null); setNewActivity({ type: 'Appel', description: '', contact: '', date: '', result: 'En attente' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Nouvelle Activité
      </button>
    </div>
    {showActivityForm && (<div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold mb-4">{editingActivity ? 'Modifier l\'Activité' : 'Nouvelle Activité'}</h3><form onSubmit={handleAddActivity} className="grid grid-cols-1 md:grid-cols-2 gap-4"><select value={newActivity.type} onChange={handleActivityTypeChange} className="p-2 border border-gray-300 rounded-lg"><option>Appel</option><option>Email</option><option>Réunion</option></select><input type="text" placeholder="Contact" value={newActivity.contact} onChange={handleActivityContactChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="text" placeholder="Description" value={newActivity.description} onChange={handleActivityDescriptionChange} className="p-2 border border-gray-300 rounded-lg md:col-span-2" required /><input type="date" value={newActivity.date} onChange={handleActivityDateChange} className="p-2 border border-gray-300 rounded-lg" /><select value={newActivity.result} onChange={handleActivityResultChange} className="p-2 border border-gray-300 rounded-lg"><option>En attente</option><option>Complété</option><option>Envoyé</option><option>Annulé</option></select><div className="md:col-span-2 flex gap-2"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingActivity ? 'Mettre à jour' : 'Ajouter'}</button><button type="button" onClick={() => { setShowActivityForm(false); setEditingActivity(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button></div></form></div>)}
    <div className="space-y-3">{activities.length === 0 && <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400 italic">Aucune activité. Créez-en une !</div>}{activities.map((activity) => (<div key={activity.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"><div className="flex items-start justify-between"><div className="flex items-start gap-4 flex-1"><div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${activity.type === 'Appel' ? 'bg-blue-100 text-blue-600' : activity.type === 'Email' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>{activity.type === 'Appel' ? <Phone className="w-5 h-5" /> : activity.type === 'Email' ? <Mail className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}</div><div className="flex-1"><p className="text-lg font-semibold text-gray-800">{activity.description}</p><p className="text-sm text-gray-600 mt-1">Contact: {activity.contact}</p><p className="text-sm text-gray-500 mt-1">Date: {activity.date}</p><p className="text-sm mt-2"><span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.result === 'Complété' ? 'bg-green-100 text-green-800' : activity.result === 'Envoyé' ? 'bg-blue-100 text-blue-800' : activity.result === 'Annulé' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{activity.result}</span></p></div></div><div className="flex gap-2 ml-4"><button onClick={() => handleEditActivity(activity)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"><Pencil className="w-3 h-3" />Modifier</button><button onClick={() => handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" />Supprimer</button></div></div></div>))}</div>
  </div>
);

const CampaignsModule = ({ campaigns, newCampaign, editingCampaign, showCampaignForm, handleCampaignNameChange, handleCampaignTypeChange, handleCampaignStatusChange, handleCampaignContactsChange, handleCampaignSentChange, handleCampaignOpenedChange, handleAddCampaign, handleEditCampaign, handleDeleteCampaign, setShowCampaignForm, setEditingCampaign, setNewCampaign }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center flex-wrap gap-3">
      <h2 className="text-2xl font-bold text-gray-800">Campagnes Marketing</h2>
      <button
        onClick={() => {
          setShowCampaignForm(true);
          setEditingCampaign(null);
          setNewCampaign({ name: '', type: 'Email', status: 'Planifiée', contacts: 0, sent: 0, opened: 0 });
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nouvelle Campagne
      </button>
    </div>

    {/* Formulaire de création / édition de Campagne */}
    {showCampaignForm && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{editingCampaign ? 'Modifier la Campagne' : 'Nouvelle Campagne'}</h3>
        <form onSubmit={handleAddCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom de la campagne"
            value={newCampaign.name}
            onChange={handleCampaignNameChange}
            className="p-2 border border-gray-300 rounded-lg"
            required
          />
          <select value={newCampaign.type} onChange={handleCampaignTypeChange} className="p-2 border border-gray-300 rounded-lg">
            <option>Email</option>
            <option>SMS</option>
            <option>Réseaux sociaux</option>
            <option>Téléphone</option>
          </select>
          <select value={newCampaign.status} onChange={handleCampaignStatusChange} className="p-2 border border-gray-300 rounded-lg">
            <option>Planifiée</option>
            <option>En cours</option>
            <option>Complétée</option>
          </select>
          <input
            type="number"
            placeholder="Contacts ciblés"
            value={newCampaign.contacts}
            onChange={handleCampaignContactsChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Envoyés"
            value={newCampaign.sent}
            onChange={handleCampaignSentChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Ouverts"
            value={newCampaign.opened}
            onChange={handleCampaignOpenedChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">
              {editingCampaign ? 'Mettre à jour' : 'Ajouter'}
            </button>
            <button type="button" onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">
              Annuler
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Liste des campagnes actives */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {campaigns.length === 0 && (
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-8 text-center text-gray-400 italic">
          Aucune campagne enregistrée. Créez votre première campagne marketing dès maintenant !
        </div>
      )}
      {campaigns.map((campaign) => {
        // Calcul du taux d'ouverture (évite la division par zéro)
        const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;

        return (
          <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  campaign.type === 'Email' ? 'bg-blue-100 text-blue-800' :
                  campaign.type === 'SMS' ? 'bg-green-100 text-green-800' :
                  campaign.type === 'Réseaux sociaux' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {campaign.type === 'Email' ? <Mail className="w-3 h-3 inline mr-1" /> : campaign.type === 'SMS' ? <Smartphone className="w-3 h-3 inline mr-1" /> : campaign.type === 'Réseaux sociaux' ? <Sparkles className="w-3 h-3 inline mr-1" /> : <Phone className="w-3 h-3 inline mr-1" />}
                  {campaign.type === 'Email' ? 'Email' : campaign.type === 'SMS' ? 'SMS' : campaign.type === 'Réseaux sociaux' ? 'Social' : 'Téléphone'}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">{campaign.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                campaign.status === 'Complétée' ? 'bg-green-100 text-green-800' :
                campaign.status === 'En cours' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            </div>

            {/* Statistiques de performance de la campagne */}
            <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-3 rounded-lg mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Ciblés</p>
                <p className="text-lg font-bold text-gray-700">{campaign.contacts || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Envoyés</p>
                <p className="text-lg font-bold text-blue-600">{campaign.sent || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Ouverts</p>
                <p className="text-lg font-bold text-green-600">{campaign.opened || 0}</p>
              </div>
            </div>

            {/* Barre de progression de conversion / taux d'ouverture */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Taux d'ouverture</span>
                <span className="font-bold text-blue-600">{openRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(openRate, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 border-t pt-3">
              <button
                onClick={() => handleEditCampaign(campaign)}
                className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                Modifier
              </button>
              <button
                onClick={() => handleDeleteCampaign(campaign.id)}
                className="text-red-600 hover:text-red-800 font-bold text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const ScrapingModule = ({ scrapingHistory, fetchScrapingHistory, scrapJob, lastProspects, setLastProspects }) => {
  const API = "http://127.0.0.1:8000";
  const [starting, setStarting] = useState(false);
  const [scrapJobLocal, setScrapJobLocal] = useState(scrapJob || { running: false, found: 0, skipped: 0, message: '', status: 'idle', recent: [] });
  const [lastProspectsLocal, setLastProspectsLocal] = useState(lastProspects || []);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchScrapingHistory && fetchScrapingHistory();
  }, []);

  // Polling automatique du statut du scraper toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/scraper/statut?scope=env`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        console.log('Scraper status (env):', data);
        setScrapJobLocal(data || { running: false, found: 0, skipped: 0, message: '', status: 'idle', recent: [] });
       
        // Récupère aussi les derniers prospects trouvés
        if (data?.running || data?.recent?.length > 0) {
          const recentRes = await fetch(`${API}/scraper/derniers-prospects`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const recentData = await recentRes.json();
          if (recentData && recentData.prospects) {
            setLastProspectsLocal(recentData.prospects.slice(0, 10));
          }
        }
      } catch (err) {
        console.log('Polling statut scraper...');
      }
    }, 2000);
   
    return () => clearInterval(interval);
  }, [token]);

  const isRunning = scrapJobLocal?.running === true;
  const found = scrapJobLocal?.found || 0;
  const skipped = scrapJobLocal?.skipped || 0;
  const recent = lastProspectsLocal || [];
  const statusMsg = scrapJobLocal?.message || '';
  const statusKind = scrapJobLocal?.status || 'idle';

  const handleLaunch = async () => {
    setStarting(true);
    try {
      const res = await fetch(`${API}/scraper/lancer-env`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      console.log('Scraper (.env) lancé:', data);
      setStarting(false);
    } catch (err) {
      console.error('Erreur lancement scraping:', err);
      setStarting(false);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await fetch(`${API}/scraper/annuler-env`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Scraper (.env) annulé:', res);
    } catch (err) {
      console.error('Erreur arrêt scraping:', err);
    }
  };

  const handleClearList = () => {
    setLastProspectsLocal([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Scraping & Prospection
        </h2>
      </div>
     
      {/* Scraping avec API .env */}
      <ScrapingStatusCard
        title={<span className="flex items-center gap-2"><Search className="w-4 h-4" /> Scraper (API .env)</span>}
        description="Lance le scraping avec l'API configurée dans le fichier .env. Les prospects sont enregistrés automatiquement dans vos contacts."
        isRunning={isRunning}
        found={found}
        skipped={skipped}
        statusMsg={statusMsg}
        statusKind={statusKind}
        recent={recent}
        onLaunch={handleLaunch}
        onCancel={handleCancel}
        isDisabled={false}
        buttonLabel={<span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Lancer le scraping</span>}
      />

      {/* Historique des Scrapings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des Scrapings
          </h3>
          <button onClick={() => fetchScrapingHistory && fetchScrapingHistory()} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Rafraîchir
          </button>
        </div>
        {(!scrapingHistory || scrapingHistory.length === 0) ? (
          <p className="text-gray-400 italic">Aucun scraping effectué</p>
        ) : (
          <div className="space-y-3">
            {scrapingHistory.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.sector} — {item.city}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {item.inserted != null ? item.inserted : '—'} ajoutés
                  </span>
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    {item.skipped != null ? item.skipped : '—'} doublons
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {item.prospectsFound} traités
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsModule = ({ opportunities, contacts }) => {
  // Mapping entre la valeur stockée en base (clé) et le label affiché
  const secteurLabels = {
    'hotel': 'Hôtel',
    'riad': 'Riad',
    'agence de voyage': 'Agence de voyage',
    'tour operator': 'Tour operator',
    'transport touristique': 'Transport touristique'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Rapports & Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloc Revenu par Étape (inchangé) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenu par Étape</h3>
          <div className="space-y-4">
            {['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage, i) => {
              const amount = opportunities.filter(o => o.stage === stage).reduce((acc, o) => acc + Number(o.amount || 0), 0);
              const total = opportunities.reduce((acc, o) => acc + Number(o.amount || 0), 0);
              const percent = total > 0 ? (amount / total) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{stage}</span>
                    <span className="text-gray-600">{amount.toLocaleString()}€</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloc Distribution des Contacts - CORRIGÉ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des Contacts</h3>
          <div className="space-y-3">
            {Object.entries(secteurLabels).map(([key, label]) => {
              const count = contacts.filter(c => c.secteur === key).length;
              const percent = contacts.length ? (count / contacts.length) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsModule = ({ smtpConfig, imapConfig, apisConfig, settingsMessage, handleSmtpProviderChange, handleSmtpEmailChange, handleSmtpPasswordChange, handleImapProviderChange, handleImapEmailChange, handleImapPasswordChange, handleApisGoogleChange, handleApisOpenaiChange, handleSaveSmtp, handleTestSmtp, handleSaveImap, handleSyncImap, handleSaveApis, handleSaveOpenaiApi }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <Settings className="w-6 h-6" />
      Settings
    </h2>
    {settingsMessage && (
      <div className={`p-4 rounded-lg flex items-center gap-2 ${settingsMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {settingsMessage.includes('✅') ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        {settingsMessage}
      </div>
    )}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          API Scraping
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Google Places API</label>
            <input type="password" placeholder="API Key" value={apisConfig.googlePlaces} onChange={handleApisGoogleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={handleSaveApis} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />Save APIs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Cog className="w-5 h-5" />
          OpenAI API
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">API Key</label>
            <input type="password" placeholder="sk-proj-..." value={apisConfig.openai} onChange={handleApisOpenaiChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={handleSaveOpenaiApi} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />Save OpenAI
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email SMTP
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Provider</label>
            <select value={smtpConfig.provider} onChange={handleSmtpProviderChange} className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="sendgrid">SendGrid</option>
              <option value="gmail">Gmail</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <input type="email" placeholder="travelpm27@gmail.com" value={smtpConfig.email} onChange={handleSmtpEmailChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="•••••••" value={smtpConfig.password} onChange={handleSmtpPasswordChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <button onClick={handleTestSmtp} className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
            <FlaskConical className="w-4 h-4" />Test
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          Email IMAP
        </h3>
        <div className="space-y-4">
          <select value={imapConfig.provider} onChange={handleImapProviderChange} className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="gmail">Gmail</option>
          </select>
          <input type="email" placeholder="contact@pmtravel.ma" value={imapConfig.email} onChange={handleImapEmailChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="•••••••" value={imapConfig.password} onChange={handleImapPasswordChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <div className="flex gap-2">
            <button onClick={handleSyncImap} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />Sync
            </button>
            <button onClick={handleSaveImap} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EmailsModule = () => {
  const [view, setView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [recherche, setRecherche] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchConversations();
    axios.post(`${API_URL}/emails/corriger-statuts`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/emails/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncIMAP = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await axios.post(`${API_URL}/settings/imap/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyncMsg(res.data.message || '✅ Synchronisation terminée');
      await fetchConversations();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Erreur de synchronisation';
      setSyncMsg(`❌ ${detail}`);
    } finally {
      setSyncing(false);
    }
  };

  const openConversation = async (conv) => {
    try {
      const res = await axios.get(`${API_URL}/emails/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data.find(c => c.email === conv.email);
      setSelectedConv(updated || conv);
    } catch {
      setSelectedConv(conv);
    }
    setView('detail');
    const unread = conv.messages.filter(m => m.direction === 'reçu' && (m.lu === false || m.lu === 0));
    for (const m of unread) {
      try {
        await axios.post(`${API_URL}/emails/recus/${m.id}/lu`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }
  };

  const convsFiltrees = conversations.filter(c => {
    if (filtre === 'repondu' && !c.a_repondu) return false;
    if (filtre === 'envoye_seul' && c.a_repondu) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      if (!c.email.includes(q) && !(c.nom || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const allSentMessages = conversations.flatMap(c => c.messages.filter(m => m.direction === 'envoyé'));
  const kpis = {
    total: conversations.length,
    reponses: conversations.filter(c => c.a_repondu).length,
    envoyes: allSentMessages.length,
    recus: conversations.reduce((s, c) => s + c.nb_recus, 0),
    ouverts: allSentMessages.filter(m => m.statut === 'ouvert' || m.statut === 'cliqué' || m.statut === 'répondu').length,
    cliques: allSentMessages.filter(m => m.statut === 'cliqué').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      <span className="text-gray-400 ml-2">Chargement des conversations...</span>
    </div>
  );

  // ── Vue détail d'une conversation ──────────────────────────────────────────
  if (view === 'detail' && selectedConv) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setView('conversations'); setSelectedConv(null); fetchConversations(); }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux conversations
        </button>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{selectedConv.nom || selectedConv.email}</h2>
              <p className="text-sm text-gray-500">{selectedConv.email}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Send className="w-3 h-3" />
                {selectedConv.nb_envoyes} envoyé(s)
              </span>
              <span className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 ${selectedConv.nb_recus > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                <Inbox className="w-3 h-3" />
                {selectedConv.nb_recus} réponse(s)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {selectedConv.messages.map((msg, i) => {
            const isSent = msg.direction === 'envoyé';
            return (
              <div
                key={msg.id || i}
                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl w-full rounded-2xl shadow-sm p-5 ${
                  isSent
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isSent ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                      }`}>
                        {isSent ? <Send className="w-3 h-3" /> : <Inbox className="w-3 h-3" />}
                        {isSent ? 'Vous' : selectedConv.nom || selectedConv.email}
                      </span>
                      {!isSent && !msg.lu && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <CircleAlert className="w-3 h-3" />
                          Nouveau
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.date_msg ? new Date(msg.date_msg).toLocaleString('fr-FR') : '—'}
                    </span>
                  </div>
                  {msg.sujet && (
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {msg.sujet}
                    </p>
                  )}
                  {isSent && msg.statut && (
                    <div className="mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        msg.statut === 'ouvert' ? 'bg-green-100 text-green-700' :
                        msg.statut === 'répondu' ? 'bg-yellow-100 text-yellow-700' :
                        msg.statut === 'cliqué' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {msg.statut === 'envoyé' && <Send className="w-3 h-3" />}
                        {msg.statut === 'ouvert' && <Eye className="w-3 h-3" />}
                        {msg.statut === 'répondu' && <Reply className="w-3 h-3" />}
                        {msg.statut === 'cliqué' && <MousePointer className="w-3 h-3" />}
                        {msg.statut === 'envoyé' ? 'Envoyé' :
                         msg.statut === 'ouvert' ? 'Ouvert' :
                         msg.statut === 'répondu' ? 'Répondu' :
                         msg.statut === 'cliqué' ? 'Cliqué' : msg.statut}
                      </span>
                      {msg.campagne_nom && (
                        <span className="ml-2 text-xs text-gray-400 flex items-center gap-1">
                          <Megaphone className="w-3 h-3" />
                          Campagne: {msg.campagne_nom}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {(msg.contenu || '').slice(0, 1000)}{msg.contenu?.length > 1000 ? '…' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Vue liste des conversations ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Conversations
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Send className="w-4 h-4" />
            Emails envoyés
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{kpis.envoyes}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Ouverts
          </p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{kpis.ouverts}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.envoyes > 0 ? Math.round((kpis.ouverts / kpis.envoyes) * 100) : 0}% taux</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Reply className="w-4 h-4" />
            Réponses
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1">{kpis.recus}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500">Taux réponse</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {kpis.total > 0 ? Math.round((kpis.reponses / kpis.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="bg-white rounded-lg shadow-md p-4 flex gap-3 flex-wrap items-center">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par email ou nom..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          className="flex-1 min-w-48 p-2 border border-gray-300 rounded-lg text-sm"
        />
        <select
          value={filtre}
          onChange={e => setFiltre(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="tous">Toutes les conversations</option>
          <option value="repondu">Avec réponse</option>
          <option value="envoye_seul">Sans réponse</option>
        </select>
        <button
          onClick={fetchConversations}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Rafraîchir
        </button>
        <button
          onClick={syncIMAP}
          disabled={syncing}
          className={`px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center gap-1 ${syncing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Inbox className="w-3 h-3" />}
          {syncing ? 'Sync...' : 'Sync IMAP'}
        </button>
        <span className="text-sm text-gray-500">{convsFiltrees.length} conversation(s)</span>
      </div>

      {syncMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${syncMsg.startsWith('❌') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
          {syncMsg.startsWith('❌') ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {syncMsg}
        </div>
      )}

      {/* Liste des conversations */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {convsFiltrees.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <Inbox className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium">Aucune conversation trouvée</p>
            <p className="text-sm mt-1">Envoyez des emails à vos prospects ou synchronisez votre boîte IMAP</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {convsFiltrees.map((conv, i) => {
              const hasReply = conv.a_repondu;
              const unread = conv.messages.filter(m => m.direction === 'reçu' && !m.lu).length;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <div
                  key={conv.email}
                  onClick={() => openConversation(conv)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${hasReply ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {(conv.nom || conv.email)[0].toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 truncate">{conv.nom !== conv.email ? conv.nom : ''}</span>
                      <span className="text-sm text-blue-600 truncate">{conv.email}</span>
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <CircleAlert className="w-2 h-2" />
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {lastMsg ? (lastMsg.sujet || lastMsg.contenu?.slice(0, 60) || '—') : '—'}
                    </p>
                  </div>

                  {/* Badges + date */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conv.dernier_message ? new Date(conv.dernier_message).toLocaleDateString('fr-FR') : '—'}
                    </span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Send className="w-3 h-3" />
                        {conv.nb_envoyes}
                      </span>
                      {(() => {
                        const sentMsgs = conv.messages.filter(m => m.direction === 'envoyé');
                        const hasOuvert = sentMsgs.some(m => m.statut === 'ouvert' || m.statut === 'répondu' || m.statut === 'cliqué');
                        return hasOuvert ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-0.5"><Eye className="w-3 h-3" /> Ouvert</span> : null;
                      })()}
                      {hasReply && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Reply className="w-3 h-3" />
                          {conv.nb_recus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const OutilsModule = ({ apisConfig, smtpConfig, setApisConfig }) => {
  const [scraperStatus, setScraperStatus] = useState('idle');
  const [scraperMessage, setScraperMessage] = useState('');
  const [scraperFound, setScraperFound] = useState(0);
  const [scraperSkipped, setScraperSkipped] = useState(0);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperRecent, setScraperRecent] = useState([]);

  const [openaiScraperStatus, setOpenaiScraperStatus] = useState('idle');
  const [openaiScraperMessage, setOpenaiScraperMessage] = useState('');
  const [openaiScraperFound, setOpenaiScraperFound] = useState(0);
  const [openaiScraperSkipped, setOpenaiScraperSkipped] = useState(0);
  const [openaiScraperRunning, setOpenaiScraperRunning] = useState(false);
  const [openaiScraperRecent, setOpenaiScraperRecent] = useState([]);

  const [postTheme, setPostTheme] = useState('desert');
  const [postPlateforme, setPostPlateforme] = useState('instagram');
  const [postLangue, setPostLangue] = useState('français');
  const [postStatus, setPostStatus] = useState('idle');
  const [postResult, setPostResult] = useState(null);
  const [calendrierStatus, setCalendrierStatus] = useState('idle');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ CORRECTION : Vérification robuste
  const hasGooglePlaces = apisConfig?.googlePlaces === true || (typeof apisConfig?.googlePlaces === 'string' && apisConfig.googlePlaces.includes('✅'));
  const hasOpenAI = apisConfig?.openai === true || (typeof apisConfig?.openai === 'string' && apisConfig.openai.includes('✅'));

  // Polling automatique pour les deux scrapers
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/scraper/statut?scope=settings`, { headers });
        const job = res.data;
        setScraperRunning(job?.running || false);
        setScraperFound(job?.found || 0);
        setScraperSkipped(job?.skipped || 0);
        if (job?.message) {
          setScraperMessage(job.message);
        }
        setScraperStatus(job?.status || 'idle');
        if (job?.recent?.length > 0) {
          setScraperRecent(job.recent);
        }
      } catch (err) {
        console.log('Polling scraper...');
      }

      try {
        const resOa = await axios.get(`${API_URL}/scraper/statut?scope=openai`, { headers });
        const jobOa = resOa.data;
        setOpenaiScraperRunning(jobOa?.running || false);
        setOpenaiScraperFound(jobOa?.found || 0);
        setOpenaiScraperSkipped(jobOa?.skipped || 0);
        if (jobOa?.message) {
          setOpenaiScraperMessage(jobOa.message);
        }
        setOpenaiScraperStatus(jobOa?.status || 'idle');
        if (jobOa?.recent?.length > 0) {
          setOpenaiScraperRecent(jobOa.recent);
        }
      } catch (err) {
        console.log('Polling scraper OpenAI...');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [token]);

  const lancerScraper = async () => {
    try {
      const res = await axios.post(`${API_URL}/scraper/lancer-tout-streaming`, {}, { headers });
      console.log('Réponse scraper:', res.data);
      if (res.data?.status === 'error') {
        setScraperMessage(res.data.message || '❌ Le scraper n\'a pas pu démarrer.');
      } else {
        setScraperMessage(res.data?.message || '✅ Scraping lancé.');
      }
    } catch (err) {
      console.error('Erreur scraper:', err);
      setScraperMessage('❌ Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const annulerScraper = async () => {
    try {
      await axios.post(`${API_URL}/scraper/annuler?scope=settings`, {}, { headers });
    } catch (err) {
      console.error('Erreur arrêt scraper:', err);
    }
  };

  const lancerScraperAvecOpenAI = async () => {
    try {
      const res = await axios.post(`${API_URL}/scraper/lancer-openai-web-search`, {}, { headers });
      console.log('Réponse scraper OpenAI:', res.data);
      if (res.data?.status === 'error') {
        setOpenaiScraperMessage(res.data.message || '❌ Le scraper n\'a pas pu démarrer.');
      } else {
        setOpenaiScraperMessage(res.data?.message || '✅ Scraping OpenAI lancé.');
      }
    } catch (err) {
      console.error('Erreur scraper OpenAI:', err);
      setOpenaiScraperMessage('❌ Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const annulerScraperOpenAI = async () => {
    try {
      await axios.post(`${API_URL}/scraper/annuler?scope=openai`, {}, { headers });
    } catch (err) {
      console.error('Erreur arrêt scraper OpenAI:', err);
    }
  };

  const genererPost = async () => {
    setPostStatus('loading');
    setPostResult(null);
    try {
      const res = await axios.post(
        `${API_URL}/social/post/generer?plateforme=${postPlateforme}&theme=${postTheme}&langue=${postLangue}`,
        {},
        { headers }
      );
      setPostResult(res.data.post);
      setPostStatus('success');
    } catch (err) {
      setPostStatus('error');
      setTimeout(() => setPostStatus('idle'), 3000);
    }
  };

  const genererCalendrier = async () => {
    setCalendrierStatus('loading');
    try {
      await axios.post(`${API_URL}/social/calendrier/generer`, {}, { headers });
      setCalendrierStatus('success');
      setTimeout(() => setCalendrierStatus('idle'), 3000);
    } catch (err) {
      setCalendrierStatus('error');
      setTimeout(() => setCalendrierStatus('idle'), 3000);
    }
  };

  const btnClass = (status) => {
    if (status === 'loading') return 'bg-gray-400 cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium w-full';
    if (status === 'success') return 'bg-green-500 text-white px-4 py-2 rounded-lg font-medium w-full';
    if (status === 'error') return 'bg-red-500 text-white px-4 py-2 rounded-lg font-medium w-full';
    return 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium w-full transition';
  };

  const btnLabel = (status, label) => {
    if (status === 'loading') return '⏳ En cours...';
    if (status === 'success') return '✅ Succès';
    if (status === 'error') return '❌ Erreur';
    return label;
  };

  return (
    <div className="space-y-6">
      {/* ===== STATUT DES APIS CONFIGURÉES ===== */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Statut des APIs configurées
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Google Places', configured: apisConfig?.googlePlaces, icon: <Map className="w-6 h-6 mx-auto" /> },
            { label: 'OpenAI', configured: apisConfig?.openai, icon: <Bot className="w-6 h-6 mx-auto" /> },
            { label: 'SendGrid SMTP', configured: !!smtpConfig?.email, icon: <Mail className="w-6 h-6 mx-auto" /> },
            { label: 'Instagram', configured: false, icon: <Camera className="w-6 h-6 mx-auto" /> }
          ].map((api, i) => (
            <div key={i} className={`p-4 rounded-lg border-2 text-center ${api.configured ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-2xl mb-2">{api.icon}</div>
              <p className="text-sm font-medium text-gray-700">{api.label}</p>
              <span className={`text-xs font-bold ${api.configured ? 'text-green-600' : 'text-gray-400'} flex items-center justify-center gap-1`}>
                {api.configured ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {api.configured ? 'Configuré' : 'Non configuré'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SECTION SCRAPING (AJOUTÉE) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Places Scraper */}
        {!hasGooglePlaces && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 col-span-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-800" />
            <div>
              <p className="text-yellow-800 font-semibold">⚠️ API Google Places non configurée</p>
              <p className="text-yellow-700 text-sm">Configurez l'API dans <strong>Settings → API Scraping</strong> pour utiliser ce scraper.</p>
            </div>
          </div>
        )}
        {hasGooglePlaces && (
          <ScrapingStatusCard
            title={<span className="flex items-center gap-2"><Search className="w-4 h-4" /> Scraper Google Maps</span>}
            description="Lance le scraper avec l'API Google Places configurée dans Settings. Les prospects sont enregistrés automatiquement."
            isRunning={scraperRunning}
            found={scraperFound}
            skipped={scraperSkipped}
            statusMsg={scraperMessage}
            statusKind={scraperStatus}
            recent={scraperRecent}
            onLaunch={lancerScraper}
            onCancel={annulerScraper}
            isDisabled={false}
            buttonLabel={<span className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Lancer le Scraper</span>}
          />
        )}

        {/* OpenAI Web Search Scraper */}
        {!hasOpenAI && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 col-span-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-800" />
            <div>
              <p className="text-yellow-800 font-semibold">⚠️ API OpenAI non configurée</p>
              <p className="text-yellow-700 text-sm">Configurez l'API dans <strong>Settings → OpenAI API</strong> pour utiliser ce scraper.</p>
            </div>
          </div>
        )}
        {hasOpenAI && (
          <ScrapingStatusCard
            title={<span className="flex items-center gap-2"><Bot className="w-4 h-4" /> Scraper OpenAI Web Search</span>}
            description="Lance le scraper avec l'API OpenAI configurée dans Settings. Synthétise les prospects depuis le web."
            isRunning={openaiScraperRunning}
            found={openaiScraperFound}
            skipped={openaiScraperSkipped}
            statusMsg={openaiScraperMessage}
            statusKind={openaiScraperStatus}
            recent={openaiScraperRecent}
            onLaunch={lancerScraperAvecOpenAI}
            onCancel={annulerScraperOpenAI}
            isDisabled={false}
            buttonLabel={<span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Scraper avec Web Search</span>}
          />
        )}
      </div>

      {/* ===== SECTION GÉNÉRATEUR DE POSTS ET CALENDRIER ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Générateur de Posts Sociaux */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Générer Post Réseaux Sociaux
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Génère un post avec ChatGPT et DALL-E. Utilise la clé OpenAI configurée dans Settings.
          </p>
          <div className="space-y-2 mb-4">
            <select
              value={postPlateforme}
              onChange={e => setPostPlateforme(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <select
              value={postTheme}
              onChange={e => setPostTheme(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="desert"><Sun className="w-4 h-4 inline mr-1" /> Désert Sahara</option>
              <option value="medina"><Building2 className="w-4 h-4 inline mr-1" /> Médina Marrakech</option>
              <option value="montagne"><Mountain className="w-4 h-4 inline mr-1" /> Montagnes Atlas</option>
              <option value="gastronomie"><Utensils className="w-4 h-4 inline mr-1" /> Gastronomie</option>
              <option value="luxe"><Sparkles className="w-4 h-4 inline mr-1" /> Luxe & Spa</option>
              <option value="aventure"><Bike className="w-4 h-4 inline mr-1" /> Aventure</option>
            </select>
            <select
              value={postLangue}
              onChange={e => setPostLangue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="français">Français</option>
              <option value="anglais">Anglais</option>
              <option value="espagnol">Espagnol</option>
            </select>
          </div>
          {postResult && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm">
              <p className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Post généré :
              </p>
              <p className="text-blue-700 text-xs">{postResult.contenu?.substring(0, 150)}...</p>
              {postResult.image_url && (
                <img src={postResult.image_url} alt="Post généré" className="mt-2 rounded w-full h-32 object-cover" />
              )}
            </div>
          )}
          <button
            onClick={genererPost}
            disabled={postStatus === 'loading'}
            className={btnClass(postStatus)}
          >
            {postStatus === 'loading' ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> En cours...</>
            ) : postStatus === 'success' ? (
              <><CheckCircle className="w-4 h-4 mr-2 inline" /> Succès</>
            ) : postStatus === 'error' ? (
              <><XCircle className="w-4 h-4 mr-2 inline" /> Erreur</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2 inline" /> Générer Post</>
            )}
          </button>
        </div>

        {/* Calendrier Éditorial */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendrier Éditorial
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Génère automatiquement 21 posts pour toute la semaine — 3 posts par jour sur Instagram, Facebook et LinkedIn.
          </p>
          <button
            onClick={genererCalendrier}
            disabled={calendrierStatus === 'loading'}
            className={btnClass(calendrierStatus)}
          >
            {calendrierStatus === 'loading' ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> En cours...</>
            ) : calendrierStatus === 'success' ? (
              <><CheckCircle className="w-4 h-4 mr-2 inline" /> Succès</>
            ) : calendrierStatus === 'error' ? (
              <><XCircle className="w-4 h-4 mr-2 inline" /> Erreur</>
            ) : (
              <><Calendar className="w-4 h-4 mr-2 inline" /> Générer Calendrier</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL CRM =====
const CRM = () => {
  console.log('CRM RE-RENDU');
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [scrapingHistory, setScrapingHistory] = useState([]);
  const [scrapJob, setScrapJob] = useState(null);
  const [lastProspects, setLastProspects] = useState([]);

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    secteur: '',
    city: '',
    status: 'Active'
  });
  const [editingContact, setEditingContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [newOpportunity, setNewOpportunity] = useState({ title: '', company: '', amount: '', stage: 'Prospection', probability: 50, expectedClose: '' });

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ type: 'Appel', description: '', contact: '', date: '', result: 'En attente' });

  const [smtpConfig, setSmtpConfig] = useState({ provider: 'gmail', email: '', password: '' });
  const [imapConfig, setImapConfig] = useState({ provider: 'gmail', email: '', password: '' });
  const [apisConfig, setApisConfig] = useState({ googlePlaces: false, openai: false });
  const [settingsMessage, setSettingsMessage] = useState('');

  const getErrorMessage = (err) => {
    if (typeof err.response?.data?.detail === 'string') return err.response.data.detail;
    if (typeof err.response?.data === 'string') return err.response.data;
    if (err.message) return err.message;
    return 'Erreur inconnue';
  };

  const handleContactNameChange = useCallback((e) => setNewContact(prev => ({...prev, name: e.target.value})), []);
  const handleContactEmailChange = useCallback((e) => setNewContact(prev => ({...prev, email: e.target.value})), []);
  const handleContactPhoneChange = useCallback((e) => setNewContact(prev => ({...prev, phone: e.target.value})), []);
  const handleContactCityChange = useCallback((e) => setNewContact(prev => ({...prev, city: e.target.value})), []);
  const handleContactSecteurChange = useCallback((e) => setNewContact(prev => ({ ...prev, secteur: e.target.value })), []);
  const handleContactStatusChange = useCallback((e) => setNewContact(prev => ({...prev, status: e.target.value})), []);

  const handleOpportunityTitleChange = useCallback((e) => setNewOpportunity(prev => ({...prev, title: e.target.value})), []);
  const handleOpportunityCompanyChange = useCallback((e) => setNewOpportunity(prev => ({...prev, company: e.target.value})), []);
  const handleOpportunityAmountChange = useCallback((e) => setNewOpportunity(prev => ({...prev, amount: e.target.value})), []);
  const handleOpportunityExpectedCloseChange = useCallback((e) => setNewOpportunity(prev => ({...prev, expectedClose: e.target.value})), []);
  const handleOpportunityStageChange = useCallback((e) => setNewOpportunity(prev => ({...prev, stage: e.target.value})), []);
  const handleOpportunityProbabilityChange = useCallback((e) => setNewOpportunity(prev => ({...prev, probability: Number(e.target.value)})), []);

  const handleActivityTypeChange = useCallback((e) => setNewActivity(prev => ({...prev, type: e.target.value})), []);
  const handleActivityContactChange = useCallback((e) => setNewActivity(prev => ({...prev, contact: e.target.value})), []);
  const handleActivityDescriptionChange = useCallback((e) => setNewActivity(prev => ({...prev, description: e.target.value})), []);
  const handleActivityDateChange = useCallback((e) => setNewActivity(prev => ({...prev, date: e.target.value})), []);
  const handleActivityResultChange = useCallback((e) => setNewActivity(prev => ({...prev, result: e.target.value})), []);

  const handleSmtpProviderChange = useCallback((e) => setSmtpConfig(prev => ({...prev, provider: e.target.value})), []);
  const handleSmtpEmailChange = useCallback((e) => setSmtpConfig(prev => ({...prev, email: e.target.value})), []);
  const handleSmtpPasswordChange = useCallback((e) => setSmtpConfig(prev => ({...prev, password: e.target.value})), []);
  const handleImapProviderChange = useCallback((e) => setImapConfig(prev => ({...prev, provider: e.target.value})), []);
  const handleImapEmailChange = useCallback((e) => setImapConfig(prev => ({...prev, email: e.target.value})), []);
  const handleImapPasswordChange = useCallback((e) => setImapConfig(prev => ({...prev, password: e.target.value})), []);
  const handleApisGoogleChange = useCallback((e) => setApisConfig(prev => ({...prev, googlePlaces: e.target.value})), []);
  const handleApisOpenaiChange = useCallback((e) => setApisConfig(prev => ({...prev, openai: e.target.value})), []);

  // ✅ CORRECTION : Stocker des booléens, pas des éléments React
  const fetchApisFromBackend = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/settings/api/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('APIs du backend:', res.data);
      setApisConfig(prev => ({
        ...prev,
        googlePlaces: res.data.google_places === true,
        openai: res.data.openai === true
      }));
    } catch (err) {
      console.error('Erreur fetch APIs:', err);
      setApisConfig(prev => ({
        ...prev,
        googlePlaces: false,
        openai: false
      }));
    }
  }, []);

  const stats = {
    totalContacts: contacts.length,
    activeDeals: opportunities.filter(o => o.stage !== 'Gagné').length,
    revenueExpected: opportunities.reduce((acc, o) => acc + Number(o.amount || 0), 0),
    conversionRate: opportunities.length ? Math.round((opportunities.filter(o => o.probability >= 75).length / opportunities.length) * 100) : 0,
    tasksThisWeek: activities.filter(a => a.result === 'En attente').length,
  };

  useEffect(() => {
    fetchContacts();
    fetchApisFromBackend();
  }, [fetchApisFromBackend]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/prospects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContacts(res.data.map(p => ({
        id: p.id,
        name: p.nom,
        email: p.email,
        phone: p.telephone,
        city: p.ville,
        secteur: p.secteur || '',
        status: p.statut || p.status || "Active",
        score: p.score || 0,
        source: p.source || ''
      })));
    } catch (err) { console.error("Erreur fetch:", err); }
  };

  useEffect(() => {
    let wasRunning = false;
    let lastContactsUpdate = 0;
    const token = localStorage.getItem('token');
    const tick = async () => {
      try {
        const res = await axios.get(`${API_URL}/scraper/statut?scope=env`, { headers: { 'Authorization': `Bearer ${token}` } });
        const job = res.data;
        setScrapJob(job);
        if (job.running && job.recent && job.recent.length > 0) {
          setLastProspects(job.recent);
        }
       
        const now = Date.now();
        if (job.running && (now - lastContactsUpdate > 5000)) {
          fetchContacts();
          lastContactsUpdate = now;
        }
       
        if (wasRunning && !job.running) {
          fetchContacts();
          fetchScrapingHistory();
        }
        wasRunning = job.running;
      } catch (err) { /* silencieux */ }
    };
    tick();
    const interval = setInterval(tick, 2500);
    return () => clearInterval(interval);
  }, []);

  const fetchScrapingHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/scraper/historique`, { headers: { 'Authorization': `Bearer ${token}` } });
      setScrapingHistory(res.data.map(item => {
        let inserted, skipped;
        try {
          const l = typeof item.logs === 'string' ? JSON.parse(item.logs) : item.logs;
          if (l) { inserted = l.inserted; skipped = l.skipped; }
        } catch (_) {}
        return {
          id: item.id, sector: item.sector, city: item.city,
          date: item.date_execution ? new Date(item.date_execution).toLocaleString('fr-FR') : '',
          status: item.status === 'completed' ? 'Complété' : (item.status || 'En attente'),
          prospectsFound: item.prospects_found || 0,
          inserted, skipped
        };
      }));
    } catch (err) { console.error('Erreur historique:', err); }
  };

  const addContactAPI = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/prospects`, {
        nom: contact.name,
        email: contact.email,
        telephone: contact.phone,
        ville: contact.city,
        secteur: contact.secteur,
        source: "crm",
        score: 0,
        email_valide: false
      }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      fetchContacts();
    } catch (err) { console.error("Erreur:", err); }
  };

  const deleteContactAPI = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/prospects/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchContacts();
    } catch (err) { console.error("Erreur:", err); }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...newContact, id: editingContact.id } : c));
      setEditingContact(null);
    } else {
      await addContactAPI(newContact);
    }
    setNewContact({ name: '', email: '', phone: '', secteur: '', city: '', status: 'Active' });
    setShowContactForm(false);
  };

  const handleEditContact = (contact) => { setEditingContact(contact); setNewContact(contact); setShowContactForm(true); };
  const handleDeleteContact = async (id) => { try { await deleteContactAPI(id); setContacts(prev => prev.filter(c => c.id !== id)); } catch (err) { console.error("Erreur delete:", err); } };
  const handleAddOpportunity = (e) => { e.preventDefault(); if (editingOpportunity) { setOpportunities(opportunities.map(o => o.id === editingOpportunity.id ? { ...newOpportunity, id: editingOpportunity.id, amount: Number(newOpportunity.amount) } : o)); setEditingOpportunity(null); } else { setOpportunities([...opportunities, { ...newOpportunity, id: Date.now(), amount: Number(newOpportunity.amount) }]); } setNewOpportunity({ title: '', company: '', amount: '', stage: 'Prospection', probability: 50, expectedClose: '' }); setShowOpportunityForm(false); };
  const handleEditOpportunity = (opp) => { setEditingOpportunity(opp); setNewOpportunity(opp); setShowOpportunityForm(true); };
  const handleDeleteOpportunity = (id) => setOpportunities(opportunities.filter(o => o.id !== id));
  const handleAddActivity = (e) => { e.preventDefault(); if (editingActivity) { setActivities(activities.map(a => a.id === editingActivity.id ? { ...newActivity, id: editingActivity.id } : a)); setEditingActivity(null); } else { setActivities([...activities, { ...newActivity, id: Date.now() }]); } setNewActivity({ type: 'Appel', description: '', contact: '', date: '', result: 'En attente' }); setShowActivityForm(false); };
  const handleEditActivity = (act) => { setEditingActivity(act); setNewActivity(act); setShowActivityForm(true); };
  const handleDeleteActivity = (id) => setActivities(activities.filter(a => a.id !== id));

  const handleSaveSmtp = async () => {
    try {
      const token = localStorage.getItem('token');
     
      const response = await axios.post(`${API_URL}/settings/smtp`, smtpConfig, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      await axios.post(`${API_URL}/emails/sauvegarder`, {
        campagne_id: null,
        email_destinataire: smtpConfig.email,
        sujet: '[CONFIG] Configuration SMTP mise à jour',
        contenu: `Configuration SMTP sauvegardée avec succès.\n\nDétails:\nServeur SMTP: ${smtpConfig.host}\nPort: ${smtpConfig.port}\nProvider: ${smtpConfig.provider}\nEmail: ${smtpConfig.email}`,
        statut: 'sauvegardé'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      setSettingsMessage('✅ Config SMTP sauvegardée et enregistrée dans Emails!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setSettingsMessage('❌ Erreur: ' + getErrorMessage(err));
    }
  };

  const handleTestSmtp = async () => {
    try {
      const token = localStorage.getItem('token');
      const testEmail = smtpConfig.email || 'test@example.com';
     
      await axios.post(`${API_URL}/settings/smtp/test`, smtpConfig, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      await axios.post(`${API_URL}/emails/sauvegarder`, {
        campagne_id: null,
        email_destinataire: testEmail,
        sujet: '[TEST] Vérification configuration SMTP',
        contenu: 'Ceci est un email de test pour vérifier la configuration SMTP du CRM.',
        statut: 'envoyé'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      setSettingsMessage('✅ Email test envoyé et enregistré dans Emails!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setSettingsMessage('❌ Erreur: ' + getErrorMessage(err));
    }
  };

  const handleSaveImap = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settings/imap`, imapConfig, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setSettingsMessage('✅ IMAP configuré!');
      setTimeout(() => setSettingsMessage(''), 5000);
    } catch (err) { setSettingsMessage('❌ Erreur: ' + getErrorMessage(err)); }
  };
  
  const handleSyncImap = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/settings/imap/sync`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      setSettingsMessage('✅ ' + res.data.count + ' emails synchronisés!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) { setSettingsMessage('❌ Erreur: ' + getErrorMessage(err)); }
  };

  const handleSaveApis = async () => {
    try {
      const token = localStorage.getItem('token');

      const googleKey = apisConfig.googlePlaces?.trim();
      if (!googleKey) {
        setSettingsMessage('⚠️ Clé Google Places requise.');
        setTimeout(() => setSettingsMessage(''), 4000);
        return;
      }

      const googleRegex = /^AIza[0-9A-Za-z\-_]{35}$/;
      if (!googleRegex.test(googleKey)) {
        setSettingsMessage('❌ Clé Google Places invalide');
        setTimeout(() => setSettingsMessage(''), 6000);
        return;
      }

      await axios.post(
        `${API_URL}/settings/api`,
        { api_name: 'google_places', config: { api_key: googleKey, enabled: true } },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setSettingsMessage('✅ Google Places API sauvegardée!');
      await fetchApisFromBackend();
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      setSettingsMessage(`❌ Erreur: ${err.message}`);
      setTimeout(() => setSettingsMessage(''), 5000);
    }
  };

  const handleSaveOpenaiApi = async () => {
    try {
      const token = localStorage.getItem('token');
     
      const openaiKey = apisConfig.openai?.trim();
      if (!openaiKey) {
        setSettingsMessage('⚠️ Clé OpenAI requise.');
        setTimeout(() => setSettingsMessage(''), 4000);
        return;
      }

      const openaiRegex = /^sk-proj-[A-Za-z0-9_-]+$/;
      if (!openaiRegex.test(openaiKey)) {
        setSettingsMessage('❌ Clé OpenAI invalide (doit commencer par sk-proj-)');
        setTimeout(() => setSettingsMessage(''), 6000);
        return;
      }

      await axios.post(
        `${API_URL}/settings/api`,
        { api_name: 'openai', config: { api_key: openaiKey, enabled: true } },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setSettingsMessage('✅ OpenAI API sauvegardée!');
      await fetchApisFromBackend();
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      setSettingsMessage(`❌ Erreur: ${err.message}`);
      setTimeout(() => setSettingsMessage(''), 5000);
    }
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard': return <Dashboard stats={stats} opportunities={opportunities} activities={activities} />;
      case 'contacts': return <ContactsModule contacts={contacts} setContacts={setContacts} newContact={newContact} editingContact={editingContact} showContactForm={showContactForm} handleContactNameChange={handleContactNameChange} handleContactEmailChange={handleContactEmailChange} handleContactPhoneChange={handleContactPhoneChange} handleContactCityChange={handleContactCityChange} handleContactSecteurChange={handleContactSecteurChange} handleContactStatusChange={handleContactStatusChange} handleAddContact={handleAddContact} handleEditContact={handleEditContact} handleDeleteContact={handleDeleteContact} setShowContactForm={setShowContactForm} setEditingContact={setEditingContact} setNewContact={setNewContact} />;
      case 'opportunities': return <OpportunitiesModule opportunities={opportunities} newOpportunity={newOpportunity} editingOpportunity={editingOpportunity} showOpportunityForm={showOpportunityForm} handleOpportunityTitleChange={handleOpportunityTitleChange} handleOpportunityCompanyChange={handleOpportunityCompanyChange} handleOpportunityAmountChange={handleOpportunityAmountChange} handleOpportunityExpectedCloseChange={handleOpportunityExpectedCloseChange} handleOpportunityStageChange={handleOpportunityStageChange} handleOpportunityProbabilityChange={handleOpportunityProbabilityChange} handleAddOpportunity={handleAddOpportunity} handleEditOpportunity={handleEditOpportunity} handleDeleteOpportunity={handleDeleteOpportunity} setShowOpportunityForm={setShowOpportunityForm} setEditingOpportunity={setEditingOpportunity} setNewOpportunity={setNewOpportunity} />;
      case 'activities': return <ActivitiesModule activities={activities} newActivity={newActivity} editingActivity={editingActivity} showActivityForm={showActivityForm} handleActivityTypeChange={handleActivityTypeChange} handleActivityContactChange={handleActivityContactChange} handleActivityDescriptionChange={handleActivityDescriptionChange} handleActivityDateChange={handleActivityDateChange} handleActivityResultChange={handleActivityResultChange} handleAddActivity={handleAddActivity} handleEditActivity={handleEditActivity} handleDeleteActivity={handleDeleteActivity} setShowActivityForm={setShowActivityForm} setEditingActivity={setEditingActivity} setNewActivity={setNewActivity} />;
      case 'reports': return <ReportsModule opportunities={opportunities} contacts={contacts} />;
      case 'scraping': return <ScrapingModule scrapingHistory={scrapingHistory} fetchScrapingHistory={fetchScrapingHistory} scrapJob={scrapJob} lastProspects={lastProspects} setLastProspects={setLastProspects} />;
      case 'outils': return <OutilsModule apisConfig={apisConfig} smtpConfig={smtpConfig} setApisConfig={setApisConfig} />;
      case 'settings': return <SettingsModule smtpConfig={smtpConfig} imapConfig={imapConfig} apisConfig={apisConfig} settingsMessage={settingsMessage} handleSmtpProviderChange={handleSmtpProviderChange} handleSmtpEmailChange={handleSmtpEmailChange} handleSmtpPasswordChange={handleSmtpPasswordChange} handleImapProviderChange={handleImapProviderChange} handleImapEmailChange={handleImapEmailChange} handleImapPasswordChange={handleImapPasswordChange} handleApisGoogleChange={handleApisGoogleChange} handleApisOpenaiChange={handleApisOpenaiChange} handleSaveSmtp={handleSaveSmtp} handleTestSmtp={handleTestSmtp} handleSaveImap={handleSaveImap} handleSyncImap={handleSyncImap} handleSaveApis={handleSaveApis} handleSaveOpenaiApi={handleSaveOpenaiApi} />;
      case 'emails': return <EmailsModule />;
      default: return <Dashboard stats={stats} opportunities={opportunities} activities={activities} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 shadow-xl`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">CRM Pro</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
       <nav className="mt-8 space-y-2 px-3">
         {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'contacts', label: 'Contacts', icon: Users },
            { id: 'scraping', label: 'Scraping', icon: Search },
            { id: 'opportunities', label: 'Opportunités', icon: Handshake },
            { id: 'activities', label: 'Activités', icon: ClipboardList },
            { id: 'reports', label: 'Rapports', icon: BarChart3 },
            { id: 'outils', label: 'Outils', icon: Wrench },
            { id: 'emails', label: 'Emails', icon: Mail },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                  key={item.id}
                  onClick={() => setCurrentModule(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentModule === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              >
                 <Icon className="w-5 h-5" />
                 {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
        })}
       </nav>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentModule === 'dashboard' ? 'Dashboard' : currentModule === 'contacts' ? 'Gestion des Contacts' : currentModule === 'scraping' ? 'Scraping de Prospects' : currentModule === 'opportunities' ? 'Pipeline de Vente' : currentModule === 'activities' ? 'Activités' : currentModule === 'campaigns' ? 'Campagnes Marketing' : currentModule === 'reports' ? 'Rapports & Analytics' : currentModule === 'outils' ? 'Outils & Actions' : currentModule === 'emails' ? 'Conversations & Emails' : 'Settings'}</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans votre CRM professionnel</p>
        </div>
        <div className="flex-1 overflow-auto p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

// ===== COMPOSANT LOGIN =====
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      );
      localStorage.setItem('token', res.data.access_token);
      onLogin();
    } catch (err) {
      setError('❌ Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM Pro</h1>
          <p className="text-gray-500 mt-2">PM Travel Agency</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-4 h-4" />
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ===== WRAPPER PRINCIPAL =====
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;
  return <CRM onLogout={handleLogout} />;
};

export default App;