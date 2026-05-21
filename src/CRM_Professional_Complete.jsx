import React, { useState, useEffect } from 'react';
const API_URL = "http://127.0.0.1:8000";

const CRM = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contacts, setContacts] = useState([]);
  
  const [opportunities, setOpportunities] = useState([]);

  const [activities, setActivities] = useState([]);

  const [campaigns, setCampaigns] = useState([]);

  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', type: 'Prospect', city: '', status: 'Active' });
  const [editingContact, setEditingContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  // Statistiques Dashboard
  const addContactAPI = async (contact) => {
  await fetch(`${API_URL}/prospects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: contact.name,
      email: contact.email,
      telephone: contact.phone,
      ville: contact.city,
      secteur: "",
      source: "crm",
      score: 0,
      email_valide: false
    })
  });

  fetchContacts(); // refresh
};
  const stats = {
    totalContacts: contacts.length,
    activeDeals: opportunities.filter(o => o.stage !== 'Gagné').length,
    revenueExpected: opportunities.reduce((acc, o) => acc + o.amount, 0),
   conversionRate: opportunities.length
      ? Math.round((opportunities.filter(o => o.probability >= 75).length / opportunities.length) * 100)
      : 0,
    activeCampaigns: campaigns.filter(c => c.status !== 'Complétée').length,
  };
useEffect(() => {
  fetchContacts();
}, []);

const fetchContacts = async () => {
  try {
    const res = await fetch(`${API_URL}/prospects`);
    const data = await res.json();

    setContacts(
      data.map(p => ({
        id: p.id,
        name: p.nom,
        email: p.email,
        phone: p.telephone,
        city: p.ville,
        type: "Prospect",
        status: p.statut || p.status || "Active"
      }))
    );
  } catch (err) {
    console.error("Erreur fetch contacts:", err);
  }
};
  const handleAddContact = async (e) => {
  e.preventDefault();

  if (editingContact) {
    setContacts(
      contacts.map(c =>
        c.id === editingContact.id
          ? { ...newContact, id: editingContact.id }
          : c
      )
    );
    setEditingContact(null);
  } else {
    await addContactAPI(newContact);
  }

  setNewContact({
    name: '',
    email: '',
    phone: '',
    type: 'Prospect',
    city: '',
    status: 'Active'
  });

  setShowContactForm(false);
};

 const deleteContactAPI = async (id) => {
  await fetch(`${API_URL}/prospects/${id}`, {
    method: "DELETE"
  });

  fetchContacts();
};
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setNewContact(contact);
    setShowContactForm(true);
  };

const handleDeleteContact = async (id) => {
    try {
      await deleteContactAPI(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
    console.error("Erreur delete:", err);
    }
};

  // Composant Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Contacts" value={stats.totalContacts} icon="👥" trend="+5%" color="from-blue-500 to-blue-600" />
        <StatCard title="Deals Actifs" value={stats.activeDeals} icon="🤝" trend="+2" color="from-green-500 to-green-600" />
        <StatCard title="Revenu Attendu" value={`${stats.revenueExpected.toLocaleString()}€`} icon="💰" trend="+12%" color="from-purple-500 to-purple-600" />
        <StatCard title="Taux Conversion" value={`${stats.conversionRate}%`} icon="📈" trend="+3%" color="from-orange-500 to-orange-600" />
        <StatCard title="Tâches Semaine" value={stats.tasksThisWeek} icon="📋" trend={stats.tasksThisWeek > 0 ? "À faire" : "Vide"} color="from-red-500 to-red-600" />
        <StatCard title="Campagnes Actives" value={stats.activeCampaigns} icon="📢" trend="En cours" color="from-indigo-500 to-indigo-600" />
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
        <span className="text-4xl">{icon}</span>
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
            const amount = data.filter(o => o.stage === stage).reduce((acc, o) => acc + o.amount, 0);
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{stage}</span>
                  <span className="text-gray-600">{amount.toLocaleString()}€</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${(count / data.length) * 100}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {type === 'activities' && (
        <div className="space-y-2">
          {data.map(activity => (
            <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
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

  // Composant Gestion des Contacts
  const ContactsModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Contacts</h2>
        <button
          onClick={() => {
            setShowContactForm(true);
            setEditingContact(null);
            setNewContact({ name: '', email: '', phone: '', type: 'Prospect', city: '', status: 'Active' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Nouveau Contact
        </button>
      </div>

      {showContactForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingContact ? 'Modifier le Contact' : 'Ajouter un Contact'}</h3>
          <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Ville"
              value={newContact.city}
              onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <select
              value={newContact.type}
              onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="Prospect">Prospect</option>
              <option value="Client">Client</option>
              <option value="Partenaire">Partenaire</option>
            </select>
            <select
              value={newContact.status}
              onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="Active">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Suspendu">Suspendu</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex-1">
                {editingContact ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowContactForm(false);
                  setEditingContact(null);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition flex-1"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Téléphone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ville</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-800">{contact.name}</td>
                <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer">{contact.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{contact.phone}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${contact.type === 'Client' ? 'bg-green-100 text-green-800' : contact.type === 'Prospect' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {contact.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{contact.city}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : contact.status === 'Inactif' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {contact.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Composant Gestion des Opportunités
  const OpportunitiesModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Pipeline de Vente</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
          + Nouvelle Opportunité
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage) => {
          const stageOpps = opportunities.filter(o => o.stage === stage);
          const total = stageOpps.reduce((acc, o) => acc + o.amount, 0);
          return (
            <div key={stage} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{stage}</h3>
              <p className="text-2xl font-bold text-blue-600">{total.toLocaleString()}€</p>
              <p className="text-sm text-gray-500 mt-1">{stageOpps.length} affaires</p>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {stageOpps.map(opp => (
                  <div key={opp.id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 hover:border-blue-400 transition cursor-pointer">
                    <p className="font-medium text-sm text-gray-800">{opp.title}</p>
                    <p className="text-xs text-gray-600">{opp.company}</p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">{opp.amount.toLocaleString()}€</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Probabilité: {opp.probability}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full" style={{ width: `${opp.probability}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Toutes les Opportunités</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Entreprise</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Montant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Étape</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Probabilité</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fermeture Prévue</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{opp.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{opp.company}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">{opp.amount.toLocaleString()}€</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {opp.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{opp.probability}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{opp.expectedClose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Composant Activités
  const ActivitiesModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Activités</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
          + Nouvelle Activité
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${activity.type === 'Appel' ? 'bg-blue-100 text-blue-600' : activity.type === 'Email' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                  {activity.type === 'Appel' ? '☎️' : activity.type === 'Email' ? '📧' : '📅'}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800">{activity.description}</p>
                  <p className="text-sm text-gray-600 mt-1">Contact: <span className="font-medium">{activity.contact}</span></p>
                  <p className="text-sm text-gray-500 mt-1">Date: {activity.date}</p>
                  <p className="text-sm mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.result.includes('Complété') ? 'bg-green-100 text-green-800' : activity.result.includes('Envoyé') ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {activity.result}
                    </span>
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Composant Campagnes
  const CampaignsModule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Campagnes Marketing</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
          + Nouvelle Campagne
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
          return (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3>
                  <p className="text-sm text-gray-600">Type: {campaign.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'Complétée' ? 'bg-green-100 text-green-800' : campaign.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{campaign.contacts}</p>
                  <p className="text-xs text-gray-500">Contacts ciblés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{campaign.sent}</p>
                  <p className="text-xs text-gray-500">Envoyés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{openRate}%</p>
                  <p className="text-xs text-gray-500">Taux d'ouverture</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${openRate}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Composant Rapports
  const ReportsModule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Rapports & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenu par Étape</h3>
          <div className="space-y-4">
            {['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage, i) => {
              const amount = opportunities.filter(o => o.stage === stage).reduce((acc, o) => acc + o.amount, 0);
              const total = opportunities.reduce((acc, o) => acc + o.amount, 0);
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des Contacts</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Clients</span>
                <span className="text-gray-600">{contacts.filter(c => c.type === 'Client').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(contacts.filter(c => c.type === 'Client').length / contacts.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Prospects</span>
                <span className="text-gray-600">{contacts.filter(c => c.type === 'Prospect').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(contacts.filter(c => c.type === 'Prospect').length / contacts.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Partenaires</span>
                <span className="text-gray-600">{contacts.filter(c => c.type === 'Partenaire').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(contacts.filter(c => c.type === 'Partenaire').length / contacts.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <ContactsModule />;
      case 'opportunities':
        return <OpportunitiesModule />;
      case 'activities':
        return <ActivitiesModule />;
      case 'campaigns':
        return <CampaignsModule />;
      case 'reports':
        return <ReportsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 shadow-xl`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">CRM Pro</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'contacts', label: 'Contacts', icon: '👥' },
            { id: 'opportunities', label: 'Opportunités', icon: '🤝' },
            { id: 'activities', label: 'Activités', icon: '📋' },
            { id: 'campaigns', label: 'Campagnes', icon: '📢' },
            { id: 'reports', label: 'Rapports', icon: '📈' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                currentModule === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentModule === 'dashboard' ? 'Dashboard' :
                 currentModule === 'contacts' ? 'Gestion des Contacts' :
                 currentModule === 'opportunities' ? 'Pipeline de Vente' :
                 currentModule === 'activities' ? 'Activités' :
                 currentModule === 'campaigns' ? 'Campagnes Marketing' :
                 'Rapports & Analytics'}
              </h1>
              <p className="text-gray-600 mt-1">Bienvenue dans votre CRM professionnel</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">🔔</button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">⚙️</button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CRM;