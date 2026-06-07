import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

// ===== MODULES =====
const Dashboard = ({ stats, opportunities, activities }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard title="Total Contacts" value={stats.totalContacts} icon="👥" trend="+5%" color="from-blue-500 to-blue-600" />
      <StatCard title="Deals Actifs" value={stats.activeDeals} icon="🤝" trend="+2" color="from-green-500 to-green-600" />
      <StatCard title="Revenu Attendu" value={`${stats.revenueExpected.toLocaleString()}€`} icon="💰" trend="+12%" color="from-purple-500 to-purple-600" />
      <StatCard title="Taux Conversion" value={`${stats.conversionRate}%`} icon="📈" trend="+3%" color="from-orange-500 to-orange-600" />
      <StatCard title="Tâches en attente" value={stats.tasksThisWeek} icon="📋" trend={stats.tasksThisWeek > 0 ? "À faire" : "Tout bon ✓"} color="from-red-500 to-red-600" />
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
      <div><p className="text-sm opacity-90">{title}</p><p className="text-3xl font-bold mt-2">{value}</p><p className="text-xs opacity-75 mt-2">{trend}</p></div>
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

  // TYPES D'ÉTABLISSEMENT
  const ESTABLISHMENT_TYPES = {
    'hotel': { name: 'Hôtel', icon: '🏨', badge: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
    'riad': { name: 'Riad', icon: '🏛️', badge: 'bg-amber-100 text-amber-800', border: 'border-amber-300' },
    'transport touristique': { name: 'Transport touristique', icon: '🚌', badge: 'bg-green-100 text-green-800', border: 'border-green-300' },
    'agence de voyage': { name: 'Agence de voyage', icon: '✈️', badge: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
    'tour operator': { name: 'Tour Operator', icon: '🎒', badge: 'bg-orange-100 text-orange-800', border: 'border-orange-300' }
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
    if (!secteur) return { name: 'Non défini', icon: '📍', badge: 'bg-gray-100 text-gray-800', border: 'border-gray-300' };
    const normalized = secteur.toLowerCase().trim();
    return ESTABLISHMENT_TYPES[normalized] || { name: secteur, icon: '📍', badge: 'bg-gray-100 text-gray-800', border: 'border-gray-300' };
  };

  const getFilteredContacts = () => {
    return contacts.filter(contact => {
      if (searchText) {
        const search = searchText.toLowerCase();
        if (!contact.name.toLowerCase().includes(search) && !contact.email.toLowerCase().includes(search)) return false;
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
          <button onClick={() => { setShowContactForm(true); setEditingContact(null); setNewContact({ name: '', email: '', phone: '', secteur: '', city: '', status: 'Active' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium">+ Nouveau Contact</button>
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
              {Object.entries(ESTABLISHMENT_TYPES).map(([key, info]) => (<option key={key} value={key}>{info.icon} {info.name}</option>))}
            </select>
            <select value={newContact.status} onChange={handleContactStatusChange} className="p-2 border border-gray-300 rounded-lg">
              <option value="Active">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingContact ? 'Mettre à jour' : 'Ajouter'}</button>
              <button type="button" onClick={() => setShowContactForm(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div><label className="block text-sm font-bold text-gray-800 mb-2">🔍 Rechercher un contact</label><div className="relative"><input type="text" placeholder="Recherchez par nom ou email…" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition" />{searchText && <button onClick={() => setSearchText('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">✕</button>}</div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-gray-800 mb-2">📍 Filtrer par ville</label><select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"><option value="">Toutes les villes ({availableCities.length})</option>{availableCities.map(city => { const count = contacts.filter(c => c.city === city).length; return <option key={city} value={city}>{city} ({count})</option>; })}</select></div>
            <div><label className="block text-sm font-bold text-gray-800 mb-2">🏢 Filtrer par secteur</label><select value={filterSecteur} onChange={(e) => setFilterSecteur(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"><option value="">Tous les secteurs ({contacts.length})</option>{secteurs.map(secteur => { const info = getSecteurInfo(secteur); const count = contacts.filter(c => c.secteur === secteur).length; return <option key={secteur} value={secteur}>{info.icon} {info.name} ({count})</option>; })}</select></div>
          </div>
          {hasActiveFilters && (<div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-3"><p className="text-sm text-blue-800"><strong>🎯 Filtres:</strong>{searchText && ` "${searchText}"`}{filterCity && ` • ${filterCity}`}{filterSecteur && ` • ${getSecteurInfo(filterSecteur).name}`}</p><button onClick={handleResetFilters} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Réinitialiser</button></div>)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b"><h3 className="font-bold text-gray-800">{hasActiveFilters ? `🔎 ${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}` : `📋 ${contacts.length} contact${contacts.length !== 1 ? 's' : ''} au total`}</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b"><tr><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nom</th><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Téléphone</th><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">🏢 SECTEUR</th><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ville</th><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th><th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th></tr></thead>
            <tbody>
              {filteredContacts.length === 0 ? (<tr><td colSpan={7} className="px-6 py-12 text-center"><p className="text-gray-400 text-lg">{contacts.length === 0 ? '😐 Aucun contact. Lancez le scraping!' : '😕 Aucun contact ne correspond à vos critères'}</p></td></tr>) : (
                filteredContacts.map((contact) => {
                  const secteurInfo = getSecteurInfo(contact.secteur);
                  return (<tr key={contact.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{contact.name}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.phone || '—'}</td>
                    <td className="px-6 py-4"><div className={`px-4 py-3 rounded-lg text-sm font-bold inline-flex items-center gap-2 ${secteurInfo.badge} border-2 ${secteurInfo.border}`}><span className="text-xl">{secteurInfo.icon}</span><span>{secteurInfo.name}</span></div></td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{contact.city}</td>
                    <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-bold ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{contact.status === 'Active' ? '🟢 Actif' : contact.status}</span></td>
                    <td className="px-6 py-4 text-sm space-x-3"><button onClick={() => handleEditContact(contact)} className="text-blue-600 hover:text-blue-800 font-bold">Modifier</button><button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-800 font-bold">Supprimer</button></td>
                  </tr>);
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OpportunitiesModule = ({ opportunities, newOpportunity, editingOpportunity, showOpportunityForm, handleOpportunityTitleChange, handleOpportunityCompanyChange, handleOpportunityAmountChange, handleOpportunityExpectedCloseChange, handleOpportunityStageChange, handleOpportunityProbabilityChange, handleAddOpportunity, handleEditOpportunity, handleDeleteOpportunity, setShowOpportunityForm, setEditingOpportunity, setNewOpportunity }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Pipeline de Vente</h2><button onClick={() => { setShowOpportunityForm(true); setEditingOpportunity(null); setNewOpportunity({ title: '', company: '', amount: '', stage: 'Prospection', probability: 50, expectedClose: '' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouvelle Opportunité</button></div>
    {showOpportunityForm && (<div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold mb-4">{editingOpportunity ? 'Modifier l\'Opportunité' : 'Nouvelle Opportunité'}</h3><form onSubmit={handleAddOpportunity} className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Titre" value={newOpportunity.title} onChange={handleOpportunityTitleChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="text" placeholder="Entreprise" value={newOpportunity.company} onChange={handleOpportunityCompanyChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="number" placeholder="Montant (€)" value={newOpportunity.amount} onChange={handleOpportunityAmountChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="date" value={newOpportunity.expectedClose} onChange={handleOpportunityExpectedCloseChange} className="p-2 border border-gray-300 rounded-lg" /><select value={newOpportunity.stage} onChange={handleOpportunityStageChange} className="p-2 border border-gray-300 rounded-lg"><option>Prospection</option><option>Négociation</option><option>Proposition</option><option>Gagné</option></select><div className="flex flex-col gap-1"><label className="text-sm text-gray-600">Probabilité : {newOpportunity.probability}%</label><input type="range" min="0" max="100" value={newOpportunity.probability} onChange={handleOpportunityProbabilityChange} className="w-full" /></div><div className="md:col-span-2 flex gap-2"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingOpportunity ? 'Mettre à jour' : 'Ajouter'}</button><button type="button" onClick={() => { setShowOpportunityForm(false); setEditingOpportunity(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button></div></form></div>)}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage) => { const stageOpps = opportunities.filter(o => o.stage === stage); const total = stageOpps.reduce((acc, o) => acc + Number(o.amount || 0), 0); return (<div key={stage} className="bg-white rounded-lg shadow-md p-4"><h3 className="font-semibold text-gray-800 mb-2">{stage}</h3><p className="text-2xl font-bold text-blue-600">{total.toLocaleString()}€</p><p className="text-sm text-gray-500 mt-1">{stageOpps.length} affaires</p></div>); })}
    </div>
  </div>
);

const ActivitiesModule = ({ activities, newActivity, editingActivity, showActivityForm, handleActivityTypeChange, handleActivityContactChange, handleActivityDescriptionChange, handleActivityDateChange, handleActivityResultChange, handleAddActivity, handleEditActivity, handleDeleteActivity, setShowActivityForm, setEditingActivity, setNewActivity }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Activités</h2><button onClick={() => { setShowActivityForm(true); setEditingActivity(null); setNewActivity({ type: 'Appel', description: '', contact: '', date: '', result: 'En attente' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouvelle Activité</button></div>
    {showActivityForm && (<div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold mb-4">{editingActivity ? 'Modifier l\'Activité' : 'Nouvelle Activité'}</h3><form onSubmit={handleAddActivity} className="grid grid-cols-1 md:grid-cols-2 gap-4"><select value={newActivity.type} onChange={handleActivityTypeChange} className="p-2 border border-gray-300 rounded-lg"><option>Appel</option><option>Email</option><option>Réunion</option></select><input type="text" placeholder="Contact" value={newActivity.contact} onChange={handleActivityContactChange} className="p-2 border border-gray-300 rounded-lg" required /><input type="text" placeholder="Description" value={newActivity.description} onChange={handleActivityDescriptionChange} className="p-2 border border-gray-300 rounded-lg md:col-span-2" required /><input type="date" value={newActivity.date} onChange={handleActivityDateChange} className="p-2 border border-gray-300 rounded-lg" /><select value={newActivity.result} onChange={handleActivityResultChange} className="p-2 border border-gray-300 rounded-lg"><option>En attente</option><option>Complété</option><option>Envoyé</option><option>Annulé</option></select><div className="md:col-span-2 flex gap-2"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingActivity ? 'Mettre à jour' : 'Ajouter'}</button><button type="button" onClick={() => { setShowActivityForm(false); setEditingActivity(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button></div></form></div>)}
    <div className="space-y-3">{activities.length === 0 && <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400 italic">Aucune activité. Créez-en une !</div>}{activities.map((activity) => (<div key={activity.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"><div className="flex items-start justify-between"><div className="flex items-start gap-4 flex-1"><div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${activity.type === 'Appel' ? 'bg-blue-100 text-blue-600' : activity.type === 'Email' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>{activity.type === 'Appel' ? '☎️' : activity.type === 'Email' ? '📧' : '📅'}</div><div className="flex-1"><p className="text-lg font-semibold text-gray-800">{activity.description}</p><p className="text-sm text-gray-600 mt-1">Contact: {activity.contact}</p><p className="text-sm text-gray-500 mt-1">Date: {activity.date}</p><p className="text-sm mt-2"><span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.result === 'Complété' ? 'bg-green-100 text-green-800' : activity.result === 'Envoyé' ? 'bg-blue-100 text-blue-800' : activity.result === 'Annulé' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{activity.result}</span></p></div></div><div className="flex gap-2 ml-4"><button onClick={() => handleEditActivity(activity)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Modifier</button><button onClick={() => handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Supprimer</button></div></div></div>))}</div>
  </div>
);

const CampaignsModule = ({ campaigns, newCampaign, editingCampaign, showCampaignForm, handleCampaignNameChange, handleCampaignTypeChange, handleCampaignStatusChange, handleCampaignContactsChange, handleCampaignSentChange, handleCampaignOpenedChange, handleAddCampaign, handleEditCampaign, handleDeleteCampaign, setShowCampaignForm, setEditingCampaign, setNewCampaign }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Campagnes Marketing</h2><button onClick={() => { setShowCampaignForm(true); setEditingCampaign(null); setNewCampaign({ name: '', type: 'Email', status: 'Planifiée', contacts: 0, sent: 0, opened: 0 }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouvelle Campagne</button></div>
    {showCampaignForm && (<div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold mb-4">{editingCampaign ? 'Modifier la Campagne' : 'Nouvelle Campagne'}</h3><form onSubmit={handleAddCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Nom de la campagne" value={newCampaign.name} onChange={handleCampaignNameChange} className="p-2 border border-gray-300 rounded-lg" required /><select value={newCampaign.type} onChange={handleCampaignTypeChange} className="p-2 border border-gray-300 rounded-lg"><option>Email</option><option>SMS</option><option>Réseaux sociaux</option><option>Téléphone</option></select><select value={newCampaign.status} onChange={handleCampaignStatusChange} className="p-2 border border-gray-300 rounded-lg"><option>Planifiée</option><option>En cours</option><option>Complétée</option></select><input type="number" placeholder="Contacts ciblés" value={newCampaign.contacts} onChange={handleCampaignContactsChange} className="p-2 border border-gray-300 rounded-lg" /><input type="number" placeholder="Envoyés" value={newCampaign.sent} onChange={handleCampaignSentChange} className="p-2 border border-gray-300 rounded-lg" /><input type="number" placeholder="Ouverts" value={newCampaign.opened} onChange={handleCampaignOpenedChange} className="p-2 border border-gray-300 rounded-lg" /><div className="md:col-span-2 flex gap-2"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingCampaign ? 'Mettre à jour' : 'Ajouter'}</button><button type="button" onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button></div></form></div>)}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{campaigns.length === 0 && <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400 italic lg:col-span-2">Aucune campagne. Créez-en une !</div>}{campaigns.map((campaign) => { const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0; return (<div key={campaign.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"><div className="flex justify-between items-start mb-4"><div><h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3><p className="text-sm text-gray-600">Type: {campaign.type}</p></div><span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'Complétée' ? 'bg-green-100 text-green-800' : campaign.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{campaign.status}</span></div><div className="grid grid-cols-3 gap-4 mb-4"><div><p className="text-2xl font-bold text-gray-800">{campaign.contacts}</p><p className="text-xs text-gray-500">Contacts ciblés</p></div><div><p className="text-2xl font-bold text-blue-600">{campaign.sent}</p><p className="text-xs text-gray-500">Envoyés</p></div><div><p className="text-2xl font-bold text-green-600">{openRate}%</p><p className="text-xs text-gray-500">Taux d'ouverture</p></div></div><div className="w-full bg-gray-200 rounded-full h-2 mb-4"><div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${openRate}%` }}></div></div><div className="flex gap-2"><button onClick={() => handleEditCampaign(campaign)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Modifier</button><button onClick={() => handleDeleteCampaign(campaign.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Supprimer</button></div></div>);})}</div>
  </div>
);

const ScrapingModule = ({ scrapingHistory, fetchScrapingHistory, scrapJob, lastProspects, setLastProspects }) => {
  const API = "http://127.0.0.1:8000";
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchScrapingHistory && fetchScrapingHistory();
  }, []);

  const isRunning = scrapJob && scrapJob.running;
  const found = scrapJob ? (scrapJob.found || 0) : 0;
  const skipped = scrapJob ? (scrapJob.skipped || 0) : 0;
  const recent = lastProspects || [];
  const statusMsg = scrapJob ? scrapJob.message : '';
  const statusKind = scrapJob ? scrapJob.status : 'idle';

  const handleLaunch = async () => {
    setStarting(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/scraper/lancer-tout-streaming`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      // Le suivi se fait via le polling global (scrapJob) — rien d'autre à faire ici
    } catch (err) {
      console.error('Erreur lancement scraping:', err);
    }
    setStarting(false);
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/scraper/annuler`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      // Le polling global mettra à jour le statut (cancelled)
    } catch (err) {
      console.error('Erreur arrêt scraping:', err);
    }
  };

  const handleClearList = () => {
    setLastProspects && setLastProspects([]);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800 mb-6">🕷️ Scraping & Prospection</h2></div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Lancer le scraping</h3>
            <p className="text-sm text-gray-500 mt-1">Le scraping tourne en arrière-plan : vous pouvez changer de page, il continue. Les prospects sont enregistrés automatiquement dans vos contacts.</p>
          </div>
          <div className="flex gap-2 items-center">
            {isRunning && (
              <button onClick={handleCancel} className="px-5 py-3 rounded-lg text-white font-medium transition whitespace-nowrap bg-red-600 hover:bg-red-700">
                🛑 Arrêter
              </button>
            )}
            <button onClick={handleLaunch} disabled={isRunning || starting} className={`px-6 py-3 rounded-lg text-white font-medium transition whitespace-nowrap ${(isRunning || starting) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isRunning ? '⏳ Scraping en cours...' : (starting ? '⏳ Démarrage...' : '🌍 Lancer le scraping')}
            </button>
          </div>
        </div>

        {isRunning && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progression (en arrière-plan)</span>
              <span className="text-sm font-semibold text-blue-600">{found} nouveaux · {skipped} doublons</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"><div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div></div>
          </div>
        )}

        {statusMsg && (
          <div className={`p-4 rounded-lg mb-4 font-medium ${statusKind === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' : statusKind === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : statusKind === 'cancelled' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
            {statusKind === 'completed' ? '✅ ' : statusKind === 'error' ? '❌ ' : statusKind === 'cancelled' ? '🛑 ' : '🕷️ '}{statusKind === 'error' ? (scrapJob.error || statusMsg) : statusMsg}
          </div>
        )}

        {recent.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800">📥 Prospects du dernier scraping ({recent.length}):</h4>
              <button onClick={handleClearList} className="text-sm px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200">🗑️ Vider la liste</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recent.map((p, i) => (
                <div key={i} className="text-sm bg-white p-2 rounded border border-gray-200">
                  <p className="font-medium text-gray-800">{p.nom}</p>
                  {p.email && <p className="text-gray-600">📧 {p.email}</p>}
                  <p className="text-gray-500 text-xs">{p.ville}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 Historique des Scrapings</h3>
          <button onClick={() => fetchScrapingHistory && fetchScrapingHistory()} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">🔄 Rafraîchir</button>
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
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{item.status}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-semibold">✅ {item.inserted != null ? item.inserted : '—'} ajoutés</span>
                  <span className="text-amber-600 font-semibold">⏭️ {item.skipped != null ? item.skipped : '—'} doublons</span>
                  <span className="text-gray-500">👥 {item.prospectsFound} traités</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsModule = ({ opportunities, contacts }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Rapports & Analytics</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">Revenu par Étape</h3><div className="space-y-4">{['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage, i) => { const amount = opportunities.filter(o => o.stage === stage).reduce((acc, o) => acc + Number(o.amount || 0), 0); const total = opportunities.reduce((acc, o) => acc + Number(o.amount || 0), 0); const percent = total > 0 ? (amount / total) * 100 : 0; return (<div key={i}><div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{stage}</span><span className="text-gray-600">{amount.toLocaleString()}€</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div></div></div>); })}</div></div>
      <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des Contacts</h3><div className="space-y-3">{['Hôtel', 'Riad', 'Agence de voyage', 'Tour operator', 'Transport touristique'].map(label => { const count = contacts.filter(c => c.secteur && c.secteur.toLowerCase() === label.toLowerCase()).length; return (<div key={label}><div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{label}</span><span className="text-gray-600">{count}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: contacts.length ? `${(count / contacts.length) * 100}%` : '0%' }}></div></div></div>); })}</div></div>
    </div>
  </div>
);

const SettingsModule = ({ smtpConfig, imapConfig, apisConfig, settingsMessage, handleSmtpProviderChange, handleSmtpEmailChange, handleSmtpPasswordChange, handleImapProviderChange, handleImapEmailChange, handleImapPasswordChange, handleApisGoogleChange, handleApisOpenaiChange, handleSaveSmtp, handleTestSmtp, handleSaveImap, handleSyncImap, handleSaveApis }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
    {settingsMessage && <div className={`p-4 rounded-lg ${settingsMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{settingsMessage}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 API Scraping</h3><div className="space-y-4"><div><label className="text-sm text-gray-600 block mb-2">Google Places API</label><input type="password" placeholder="API Key" value={apisConfig.googlePlaces} onChange={handleApisGoogleChange} className="w-full p-2 border border-gray-300 rounded-lg" /></div><div><label className="text-sm text-gray-600 block mb-2">OpenAI API</label><input type="password" placeholder="API Key" value={apisConfig.openai} onChange={handleApisOpenaiChange} className="w-full p-2 border border-gray-300 rounded-lg" /></div><button onClick={handleSaveApis} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">💾 Save APIs</button></div></div>
      <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">📧 Email SMTP</h3><div className="space-y-4"><div><label className="text-sm text-gray-600 block mb-2">Provider</label><select value={smtpConfig.provider} onChange={handleSmtpProviderChange} className="w-full p-2 border border-gray-300 rounded-lg"><option value="sendgrid">SendGrid</option><option value="gmail">Gmail</option><option value="hostinger">Hostinger</option><option value="custom">Custom</option></select></div><input type="email" placeholder="contact@pmtravel.ma" value={smtpConfig.email} onChange={handleSmtpEmailChange} className="w-full p-2 border border-gray-300 rounded-lg" /><input type="password" placeholder="•••••••" value={smtpConfig.password} onChange={handleSmtpPasswordChange} className="w-full p-2 border border-gray-300 rounded-lg" /><div className="flex gap-2"><button onClick={handleTestSmtp} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">🧪 Test</button><button onClick={handleSaveSmtp} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">💾 Save</button></div></div></div>
      <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">📨 Email IMAP</h3><div className="space-y-4"><select value={imapConfig.provider} onChange={handleImapProviderChange} className="w-full p-2 border border-gray-300 rounded-lg"><option value="gmail">Gmail</option><option value="hostinger">Hostinger</option></select><input type="email" placeholder="contact@pmtravel.ma" value={imapConfig.email} onChange={handleImapEmailChange} className="w-full p-2 border border-gray-300 rounded-lg" /><input type="password" placeholder="•••••••" value={imapConfig.password} onChange={handleImapPasswordChange} className="w-full p-2 border border-gray-300 rounded-lg" /><div className="flex gap-2"><button onClick={handleSyncImap} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">🔄 Sync</button><button onClick={handleSaveImap} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">💾 Save</button></div></div></div>
    </div>
  </div>
);

// ===== COMPOSANT PRINCIPAL CRM =====
const CRM = () => {
  console.log('CRM RE-RENDU');
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [scrapingHistory, setScrapingHistory] = useState([]);
  // État du scraping en arrière-plan (persiste à travers les changements de page)
  const [scrapJob, setScrapJob] = useState(null);
  // Liste des prospects du dernier scraping — reste affichée jusqu'au prochain lancement
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

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({ name: '', type: 'Email', status: 'Planifiée', contacts: 0, sent: 0, opened: 0 });

  const [smtpConfig, setSmtpConfig] = useState({ provider: 'gmail', email: '', password: '' });
  const [imapConfig, setImapConfig] = useState({ provider: 'gmail', email: '', password: '' });
  const [apisConfig, setApisConfig] = useState({ googlePlaces: '', openai: '' });
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

  const handleCampaignNameChange = useCallback((e) => setNewCampaign(prev => ({...prev, name: e.target.value})), []);
  const handleCampaignTypeChange = useCallback((e) => setNewCampaign(prev => ({...prev, type: e.target.value})), []);
  const handleCampaignStatusChange = useCallback((e) => setNewCampaign(prev => ({...prev, status: e.target.value})), []);
  const handleCampaignContactsChange = useCallback((e) => setNewCampaign(prev => ({...prev, contacts: e.target.value})), []);
  const handleCampaignSentChange = useCallback((e) => setNewCampaign(prev => ({...prev, sent: e.target.value})), []);
  const handleCampaignOpenedChange = useCallback((e) => setNewCampaign(prev => ({...prev, opened: e.target.value})), []);

  const handleSmtpProviderChange = useCallback((e) => setSmtpConfig(prev => ({...prev, provider: e.target.value})), []);
  const handleSmtpEmailChange = useCallback((e) => setSmtpConfig(prev => ({...prev, email: e.target.value})), []);
  const handleSmtpPasswordChange = useCallback((e) => setSmtpConfig(prev => ({...prev, password: e.target.value})), []);
  const handleImapProviderChange = useCallback((e) => setImapConfig(prev => ({...prev, provider: e.target.value})), []);
  const handleImapEmailChange = useCallback((e) => setImapConfig(prev => ({...prev, email: e.target.value})), []);
  const handleImapPasswordChange = useCallback((e) => setImapConfig(prev => ({...prev, password: e.target.value})), []);
  const handleApisGoogleChange = useCallback((e) => setApisConfig(prev => ({...prev, googlePlaces: e.target.value})), []);
  const handleApisOpenaiChange = useCallback((e) => setApisConfig(prev => ({...prev, openai: e.target.value})), []);

  const stats = {
    totalContacts: contacts.length,
    activeDeals: opportunities.filter(o => o.stage !== 'Gagné').length,
    revenueExpected: opportunities.reduce((acc, o) => acc + Number(o.amount || 0), 0),
    conversionRate: opportunities.length ? Math.round((opportunities.filter(o => o.probability >= 75).length / opportunities.length) * 100) : 0,
    tasksThisWeek: activities.filter(a => a.result === 'En attente').length,
    activeCampaigns: campaigns.filter(c => c.status !== 'Complétée').length,
  };

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/prospects`, { headers: { 'Authorization': `Bearer ${token}` } });
      setContacts(res.data.map(p => ({
        id: p.id,
        name: p.nom,
        email: p.email,
        phone: p.telephone,
        city: p.ville,
        secteur: p.secteur || '',
        status: p.statut || p.status || "Active"
      })));
    } catch (err) { console.error("Erreur fetch:", err); }
  };

  // Polling permanent du statut de scraping (au niveau CRM => survit aux changements de page)
  useEffect(() => {
    let wasRunning = false;
    const token = localStorage.getItem('token');
    const tick = async () => {
      try {
        const res = await axios.get(`${API_URL}/scraper/statut`, { headers: { 'Authorization': `Bearer ${token}` } });
        const job = res.data;
        setScrapJob(job);
        // Pendant un scraping actif, on reflète les prospects détectés.
        // Une fois terminé, on n'écrase plus la liste (le bouton Vider la contrôle).
        if (job.running && job.recent && job.recent.length > 0) {
          setLastProspects(job.recent);
        }
        // Quand un scraping vient de se terminer, on rafraîchit contacts + historique
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
        secteur: contact.secteur,   // ← envoi du secteur
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
  const handleAddCampaign = (e) => { e.preventDefault(); if (editingCampaign) { setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...newCampaign, id: editingCampaign.id } : c)); setEditingCampaign(null); } else { setCampaigns([...campaigns, { ...newCampaign, id: Date.now(), contacts: Number(newCampaign.contacts), sent: Number(newCampaign.sent), opened: Number(newCampaign.opened) }]); } setNewCampaign({ name: '', type: 'Email', status: 'Planifiée', contacts: 0, sent: 0, opened: 0 }); setShowCampaignForm(false); };
  const handleEditCampaign = (camp) => { setEditingCampaign(camp); setNewCampaign(camp); setShowCampaignForm(true); };
  const handleDeleteCampaign = (id) => setCampaigns(campaigns.filter(c => c.id !== id));

  const handleSaveSmtp = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settings/smtp`, smtpConfig, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setSettingsMessage('✅ SMTP configuré!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) { setSettingsMessage('❌ Erreur: ' + getErrorMessage(err)); }
  };
  const handleTestSmtp = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settings/smtp/test`, smtpConfig, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setSettingsMessage('✅ Email test envoyé!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) { setSettingsMessage('❌ Erreur: ' + getErrorMessage(err)); }
  };
  const handleSaveImap = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settings/imap`, imapConfig, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setSettingsMessage('✅ IMAP configuré!');
      setTimeout(() => setSettingsMessage(''), 3000);
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
    let savedCount = 0;
    let errors = [];

    // ---- Validation Google Places ----
    const googleKey = apisConfig.googlePlaces?.trim();
    if (googleKey) {
      // Format approximatif : commence par AIza, 39 caractères environ
      const googleRegex = /^AIza[0-9A-Za-z\-_]{35}$/;
      if (!googleRegex.test(googleKey)) {
        errors.push('Clé Google Places invalide (format attendu : commence par AIza, 39 caractères)');
      } else {
        await axios.post(
          `${API_URL}/settings/api`,
          { api_name: 'google_places', config: { api_key: googleKey, enabled: true } },
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        savedCount++;
      }
    }

    // ---- Validation OpenAI ----
    const openaiKey = apisConfig.openai?.trim();
    if (openaiKey) {
      const openaiRegex = /^sk-[A-Za-z0-9]{48}$/;
      if (!openaiRegex.test(openaiKey)) {
        errors.push('Clé OpenAI invalide (format attendu : commence par sk- et 48 caractères)');
      } else {
        await axios.post(
          `${API_URL}/settings/api`,
          { api_name: 'openai', config: { api_key: openaiKey, enabled: true } },
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        savedCount++;
      }
    }

    // Aucune clé renseignée ou toutes vides ?
    if (!googleKey && !openaiKey) {
      setSettingsMessage('⚠️ Aucune clé API renseignée.');
      setTimeout(() => setSettingsMessage(''), 4000);
      return;
    }

    // Affichage des erreurs de format
    if (errors.length > 0) {
      setSettingsMessage(`❌ ${errors.join(' · ')}`);
      setTimeout(() => setSettingsMessage(''), 6000);
      return;
    }

    // Succès
    if (savedCount === 1) {
      setSettingsMessage(`✅ 1 clé API sauvegardée (format valide).`);
    } else if (savedCount === 2) {
      setSettingsMessage(`✅ 2 clés API sauvegardées (format valide).`);
    }
    setTimeout(() => setSettingsMessage(''), 3000);
  } catch (err) {
    const errorMsg = getErrorMessage(err);
    setSettingsMessage(`❌ Erreur backend : ${errorMsg}`);
    setTimeout(() => setSettingsMessage(''), 5000);
  }
};
  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard': return <Dashboard stats={stats} opportunities={opportunities} activities={activities} />;
      case 'contacts': return <ContactsModule contacts={contacts} setContacts={setContacts} newContact={newContact} editingContact={editingContact} showContactForm={showContactForm} handleContactNameChange={handleContactNameChange} handleContactEmailChange={handleContactEmailChange} handleContactPhoneChange={handleContactPhoneChange} handleContactCityChange={handleContactCityChange} handleContactSecteurChange={handleContactSecteurChange} handleContactStatusChange={handleContactStatusChange} handleAddContact={handleAddContact} handleEditContact={handleEditContact} handleDeleteContact={handleDeleteContact} setShowContactForm={setShowContactForm} setEditingContact={setEditingContact} setNewContact={setNewContact} />;
      case 'opportunities': return <OpportunitiesModule opportunities={opportunities} newOpportunity={newOpportunity} editingOpportunity={editingOpportunity} showOpportunityForm={showOpportunityForm} handleOpportunityTitleChange={handleOpportunityTitleChange} handleOpportunityCompanyChange={handleOpportunityCompanyChange} handleOpportunityAmountChange={handleOpportunityAmountChange} handleOpportunityExpectedCloseChange={handleOpportunityExpectedCloseChange} handleOpportunityStageChange={handleOpportunityStageChange} handleOpportunityProbabilityChange={handleOpportunityProbabilityChange} handleAddOpportunity={handleAddOpportunity} handleEditOpportunity={handleEditOpportunity} handleDeleteOpportunity={handleDeleteOpportunity} setShowOpportunityForm={setShowOpportunityForm} setEditingOpportunity={setEditingOpportunity} setNewOpportunity={setNewOpportunity} />;
      case 'activities': return <ActivitiesModule activities={activities} newActivity={newActivity} editingActivity={editingActivity} showActivityForm={showActivityForm} handleActivityTypeChange={handleActivityTypeChange} handleActivityContactChange={handleActivityContactChange} handleActivityDescriptionChange={handleActivityDescriptionChange} handleActivityDateChange={handleActivityDateChange} handleActivityResultChange={handleActivityResultChange} handleAddActivity={handleAddActivity} handleEditActivity={handleEditActivity} handleDeleteActivity={handleDeleteActivity} setShowActivityForm={setShowActivityForm} setEditingActivity={setEditingActivity} setNewActivity={setNewActivity} />;
      case 'campaigns': return <CampaignsModule campaigns={campaigns} newCampaign={newCampaign} editingCampaign={editingCampaign} showCampaignForm={showCampaignForm} handleCampaignNameChange={handleCampaignNameChange} handleCampaignTypeChange={handleCampaignTypeChange} handleCampaignStatusChange={handleCampaignStatusChange} handleCampaignContactsChange={handleCampaignContactsChange} handleCampaignSentChange={handleCampaignSentChange} handleCampaignOpenedChange={handleCampaignOpenedChange} handleAddCampaign={handleAddCampaign} handleEditCampaign={handleEditCampaign} handleDeleteCampaign={handleDeleteCampaign} setShowCampaignForm={setShowCampaignForm} setEditingCampaign={setEditingCampaign} setNewCampaign={setNewCampaign} />;
      case 'reports': return <ReportsModule opportunities={opportunities} contacts={contacts} />;
      case 'scraping': return <ScrapingModule scrapingHistory={scrapingHistory} fetchScrapingHistory={fetchScrapingHistory} scrapJob={scrapJob} lastProspects={lastProspects} setLastProspects={setLastProspects} />;
      case 'settings': return <SettingsModule smtpConfig={smtpConfig} imapConfig={imapConfig} apisConfig={apisConfig} settingsMessage={settingsMessage} handleSmtpProviderChange={handleSmtpProviderChange} handleSmtpEmailChange={handleSmtpEmailChange} handleSmtpPasswordChange={handleSmtpPasswordChange} handleImapProviderChange={handleImapProviderChange} handleImapEmailChange={handleImapEmailChange} handleImapPasswordChange={handleImapPasswordChange} handleApisGoogleChange={handleApisGoogleChange} handleApisOpenaiChange={handleApisOpenaiChange} handleSaveSmtp={handleSaveSmtp} handleTestSmtp={handleTestSmtp} handleSaveImap={handleSaveImap} handleSyncImap={handleSyncImap} handleSaveApis={handleSaveApis} />;
      default: return <Dashboard stats={stats} opportunities={opportunities} activities={activities} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 shadow-xl`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">CRM Pro</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition">{sidebarOpen ? '←' : '→'}</button>
        </div>
        <nav className="mt-8 space-y-2 px-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'contacts', label: 'Contacts', icon: '👥' },
            { id: 'scraping', label: 'Scraping', icon: '🕷️' },
            { id: 'opportunities', label: 'Opportunités', icon: '🤝' },
            { id: 'activities', label: 'Activités', icon: '📋' },
            { id: 'campaigns', label: 'Campagnes', icon: '📢' },
            { id: 'reports', label: 'Rapports', icon: '📈' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((item) => (
            <button key={item.id} onClick={() => setCurrentModule(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentModule === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentModule === 'dashboard' ? 'Dashboard' : currentModule === 'contacts' ? 'Gestion des Contacts' : currentModule === 'scraping' ? 'Scraping de Prospects' : currentModule === 'opportunities' ? 'Pipeline de Vente' : currentModule === 'activities' ? 'Activités' : currentModule === 'campaigns' ? 'Campagnes Marketing' : currentModule === 'reports' ? 'Rapports & Analytics' : 'Settings'}</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans votre CRM professionnel</p>
        </div>
        <div className="flex-1 overflow-auto p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default CRM;