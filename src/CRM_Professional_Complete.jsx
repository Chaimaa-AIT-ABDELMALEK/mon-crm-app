import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

// ===== MODULES EN DEHORS DU CRM =====
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

const ContactsModule = ({ contacts, newContact, editingContact, showContactForm, handleContactNameChange, handleContactEmailChange, handleContactPhoneChange, handleContactCityChange, handleContactTypeChange, handleContactStatusChange, handleAddContact, handleEditContact, handleDeleteContact, setShowContactForm, setEditingContact, setNewContact }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Gestion des Contacts</h2>
      <button onClick={() => { setShowContactForm(true); setEditingContact(null); setNewContact({ name: '', email: '', phone: '', type: 'Prospect', city: '', status: 'Active' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouveau Contact</button>
    </div>
    {showContactForm && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">{editingContact ? 'Modifier le Contact' : 'Ajouter un Contact'}</h3>
        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nom" value={newContact.name} onChange={handleContactNameChange} className="p-2 border border-gray-300 rounded-lg" required />
          <input type="email" placeholder="Email" value={newContact.email} onChange={handleContactEmailChange} className="p-2 border border-gray-300 rounded-lg" required />
          <input type="tel" placeholder="Téléphone" value={newContact.phone} onChange={handleContactPhoneChange} className="p-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Ville" value={newContact.city} onChange={handleContactCityChange} className="p-2 border border-gray-300 rounded-lg" />
          <select value={newContact.type} onChange={handleContactTypeChange} className="p-2 border border-gray-300 rounded-lg"><option value="Prospect">Prospect</option><option value="Client">Client</option><option value="Partenaire">Partenaire</option></select>
          <select value={newContact.status} onChange={handleContactStatusChange} className="p-2 border border-gray-300 rounded-lg"><option value="Active">Actif</option><option value="Inactif">Inactif</option><option value="Suspendu">Suspendu</option></select>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex-1">{editingContact ? 'Mettre à jour' : 'Ajouter'}</button>
            <button type="button" onClick={() => { setShowContactForm(false); setEditingContact(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition flex-1">Annuler</button>
          </div>
        </form>
      </div>
    )}
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>{['Nom','Email','Téléphone','Type','Ville','Statut','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}</tr>
        </thead>
        <tbody>
          {contacts.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">Aucun contact. Ajoutez-en un !</td></tr>}
          {contacts.map((contact) => (
            <tr key={contact.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-800">{contact.name}</td>
              <td className="px-6 py-4 text-sm text-blue-600">{contact.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{contact.phone}</td>
              <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${contact.type === 'Client' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{contact.type}</span></td>
              <td className="px-6 py-4 text-sm text-gray-600">{contact.city}</td>
              <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{contact.status}</span></td>
              <td className="px-6 py-4 text-sm space-x-2">
                <button onClick={() => handleEditContact(contact)} className="text-blue-600 hover:text-blue-800 font-medium">Modifier</button>
                <button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-800 font-medium">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OpportunitiesModule = ({ opportunities, newOpportunity, editingOpportunity, showOpportunityForm, handleOpportunityTitleChange, handleOpportunityCompanyChange, handleOpportunityAmountChange, handleOpportunityExpectedCloseChange, handleOpportunityStageChange, handleOpportunityProbabilityChange, handleAddOpportunity, handleEditOpportunity, handleDeleteOpportunity, setShowOpportunityForm, setEditingOpportunity, setNewOpportunity }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Pipeline de Vente</h2>
      <button onClick={() => { setShowOpportunityForm(true); setEditingOpportunity(null); setNewOpportunity({ title: '', company: '', amount: '', stage: 'Prospection', probability: 50, expectedClose: '' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouvelle Opportunité</button>
    </div>
    {showOpportunityForm && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{editingOpportunity ? 'Modifier l\'Opportunité' : 'Nouvelle Opportunité'}</h3>
        <form onSubmit={handleAddOpportunity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Titre" value={newOpportunity.title} onChange={handleOpportunityTitleChange} className="p-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Entreprise" value={newOpportunity.company} onChange={handleOpportunityCompanyChange} className="p-2 border border-gray-300 rounded-lg" required />
          <input type="number" placeholder="Montant (€)" value={newOpportunity.amount} onChange={handleOpportunityAmountChange} className="p-2 border border-gray-300 rounded-lg" required />
          <input type="date" value={newOpportunity.expectedClose} onChange={handleOpportunityExpectedCloseChange} className="p-2 border border-gray-300 rounded-lg" />
          <select value={newOpportunity.stage} onChange={handleOpportunityStageChange} className="p-2 border border-gray-300 rounded-lg"><option>Prospection</option><option>Négociation</option><option>Proposition</option><option>Gagné</option></select>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Probabilité : {newOpportunity.probability}%</label>
            <input type="range" min="0" max="100" value={newOpportunity.probability} onChange={handleOpportunityProbabilityChange} className="w-full" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingOpportunity ? 'Mettre à jour' : 'Ajouter'}</button>
            <button type="button" onClick={() => { setShowOpportunityForm(false); setEditingOpportunity(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button>
          </div>
        </form>
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {['Prospection', 'Négociation', 'Proposition', 'Gagné'].map((stage) => {
        const stageOpps = opportunities.filter(o => o.stage === stage);
        const total = stageOpps.reduce((acc, o) => acc + Number(o.amount || 0), 0);
        return (
          <div key={stage} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{stage}</h3>
            <p className="text-2xl font-bold text-blue-600">{total.toLocaleString()}€</p>
            <p className="text-sm text-gray-500 mt-1">{stageOpps.length} affaires</p>
          </div>
        );
      })}
    </div>
  </div>
);

const ActivitiesModule = ({ activities, newActivity, editingActivity, showActivityForm, handleActivityTypeChange, handleActivityContactChange, handleActivityDescriptionChange, handleActivityDateChange, handleActivityResultChange, handleAddActivity, handleEditActivity, handleDeleteActivity, setShowActivityForm, setEditingActivity, setNewActivity }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Activités</h2>
      <button onClick={() => { setShowActivityForm(true); setEditingActivity(null); setNewActivity({ type: 'Appel', description: '', contact: '', date: '', result: 'En attente' }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouvelle Activité</button>
    </div>
    {showActivityForm && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{editingActivity ? 'Modifier l\'Activité' : 'Nouvelle Activité'}</h3>
        <form onSubmit={handleAddActivity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={newActivity.type} onChange={handleActivityTypeChange} className="p-2 border border-gray-300 rounded-lg"><option>Appel</option><option>Email</option><option>Réunion</option></select>
          <input type="text" placeholder="Contact" value={newActivity.contact} onChange={handleActivityContactChange} className="p-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Description" value={newActivity.description} onChange={handleActivityDescriptionChange} className="p-2 border border-gray-300 rounded-lg md:col-span-2" required />
          <input type="date" value={newActivity.date} onChange={handleActivityDateChange} className="p-2 border border-gray-300 rounded-lg" />
          <select value={newActivity.result} onChange={handleActivityResultChange} className="p-2 border border-gray-300 rounded-lg"><option>En attente</option><option>Complété</option><option>Envoyé</option><option>Annulé</option></select>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingActivity ? 'Mettre à jour' : 'Ajouter'}</button>
            <button type="button" onClick={() => { setShowActivityForm(false); setEditingActivity(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button>
          </div>
        </form>
      </div>
    )}
    <div className="space-y-3">
      {activities.length === 0 && <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400 italic">Aucune activité. Créez-en une !</div>}
      {activities.map((activity) => (
        <div key={activity.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${activity.type === 'Appel' ? 'bg-blue-100 text-blue-600' : activity.type === 'Email' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                {activity.type === 'Appel' ? '☎️' : activity.type === 'Email' ? '📧' : '📅'}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">{activity.description}</p>
                <p className="text-sm text-gray-600 mt-1">Contact: {activity.contact}</p>
                <p className="text-sm text-gray-500 mt-1">Date: {activity.date}</p>
                <p className="text-sm mt-2"><span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.result === 'Complété' ? 'bg-green-100 text-green-800' : activity.result === 'Envoyé' ? 'bg-blue-100 text-blue-800' : activity.result === 'Annulé' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{activity.result}</span></p>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => handleEditActivity(activity)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Modifier</button>
              <button onClick={() => handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Supprimer</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CampaignsModule = ({ campaigns, newCampaign, editingCampaign, showCampaignForm, handleCampaignNameChange, handleCampaignTypeChange, handleCampaignStatusChange, handleCampaignContactsChange, handleCampaignSentChange, handleCampaignOpenedChange, handleAddCampaign, handleEditCampaign, handleDeleteCampaign, setShowCampaignForm, setEditingCampaign, setNewCampaign }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Campagnes Marketing</h2>
      <button onClick={() => { setShowCampaignForm(true); setEditingCampaign(null); setNewCampaign({ name: '', type: 'Email', status: 'Planifiée', contacts: 0, sent: 0, opened: 0 }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">+ Nouvelle Campagne</button>
    </div>
    {showCampaignForm && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{editingCampaign ? 'Modifier la Campagne' : 'Nouvelle Campagne'}</h3>
        <form onSubmit={handleAddCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nom de la campagne" value={newCampaign.name} onChange={handleCampaignNameChange} className="p-2 border border-gray-300 rounded-lg" required />
          <select value={newCampaign.type} onChange={handleCampaignTypeChange} className="p-2 border border-gray-300 rounded-lg"><option>Email</option><option>SMS</option><option>Réseaux sociaux</option><option>Téléphone</option></select>
          <select value={newCampaign.status} onChange={handleCampaignStatusChange} className="p-2 border border-gray-300 rounded-lg"><option>Planifiée</option><option>En cours</option><option>Complétée</option></select>
          <input type="number" placeholder="Contacts ciblés" value={newCampaign.contacts} onChange={handleCampaignContactsChange} className="p-2 border border-gray-300 rounded-lg" />
          <input type="number" placeholder="Envoyés" value={newCampaign.sent} onChange={handleCampaignSentChange} className="p-2 border border-gray-300 rounded-lg" />
          <input type="number" placeholder="Ouverts" value={newCampaign.opened} onChange={handleCampaignOpenedChange} className="p-2 border border-gray-300 rounded-lg" />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">{editingCampaign ? 'Mettre à jour' : 'Ajouter'}</button>
            <button type="button" onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Annuler</button>
          </div>
        </form>
      </div>
    )}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {campaigns.length === 0 && <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400 italic lg:col-span-2">Aucune campagne. Créez-en une !</div>}
      {campaigns.map((campaign) => {
        const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
        return (
          <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3>
                <p className="text-sm text-gray-600">Type: {campaign.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'Complétée' ? 'bg-green-100 text-green-800' : campaign.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{campaign.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><p className="text-2xl font-bold text-gray-800">{campaign.contacts}</p><p className="text-xs text-gray-500">Contacts ciblés</p></div>
              <div><p className="text-2xl font-bold text-blue-600">{campaign.sent}</p><p className="text-xs text-gray-500">Envoyés</p></div>
              <div><p className="text-2xl font-bold text-green-600">{openRate}%</p><p className="text-xs text-gray-500">Taux d'ouverture</p></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${openRate}%` }}></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditCampaign(campaign)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Modifier</button>
              <button onClick={() => handleDeleteCampaign(campaign.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Supprimer</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const ReportsModule = ({ opportunities, contacts }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Rapports & Analytics</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution des Contacts</h3>
        <div className="space-y-3">
          {[['Clients', 'Client', 'bg-green-500'], ['Prospects', 'Prospect', 'bg-blue-500'], ['Partenaires', 'Partenaire', 'bg-purple-500']].map(([label, type, color]) => (
            <div key={type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-600">{contacts.filter(c => c.type === type).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: contacts.length ? `${(contacts.filter(c => c.type === type).length / contacts.length) * 100}%` : '0%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SettingsModule = ({ smtpConfig, imapConfig, apisConfig, settingsMessage, handleSmtpProviderChange, handleSmtpEmailChange, handleSmtpPasswordChange, handleImapProviderChange, handleImapEmailChange, handleImapPasswordChange, handleApisGoogleChange, handleApisOpenaiChange, handleSaveSmtp, handleTestSmtp, handleSaveImap, handleSyncImap, handleSaveApis }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
    {settingsMessage && <div className={`p-4 rounded-lg ${settingsMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{settingsMessage}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 API Scraping</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Google Places API</label>
            <input type="password" placeholder="API Key" value={apisConfig.googlePlaces} onChange={handleApisGoogleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">OpenAI API</label>
            <input type="password" placeholder="API Key" value={apisConfig.openai} onChange={handleApisOpenaiChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={handleSaveApis} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">💾 Save APIs</button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📧 Email SMTP</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Provider</label>
            <select value={smtpConfig.provider} onChange={handleSmtpProviderChange} className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="gmail">Gmail</option><option value="hostinger">Hostinger</option><option value="custom">Custom</option>
            </select>
          </div>
          <input type="email" placeholder="contact@pmtravel.ma" value={smtpConfig.email} onChange={handleSmtpEmailChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="•••••••" value={smtpConfig.password} onChange={handleSmtpPasswordChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <div className="flex gap-2">
            <button onClick={handleTestSmtp} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">🧪 Test</button>
            <button onClick={handleSaveSmtp} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">💾 Save</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📨 Email IMAP</h3>
        <div className="space-y-4">
          <select value={imapConfig.provider} onChange={handleImapProviderChange} className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="gmail">Gmail</option><option value="hostinger">Hostinger</option>
          </select>
          <input type="email" placeholder="contact@pmtravel.ma" value={imapConfig.email} onChange={handleImapEmailChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="•••••••" value={imapConfig.password} onChange={handleImapPasswordChange} className="w-full p-2 border border-gray-300 rounded-lg" />
          <div className="flex gap-2">
            <button onClick={handleSyncImap} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">🔄 Sync</button>
            <button onClick={handleSaveImap} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">💾 Save</button>
          </div>
        </div>
      </div>
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

  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', type: 'Prospect', city: '', status: 'Active' });
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

  // ===== FONCTION HELPER POUR EXTRAIRE LE MESSAGE D'ERREUR =====
  const getErrorMessage = (err) => {
    if (typeof err.response?.data?.detail === 'string') {
      return err.response.data.detail;
    } else if (typeof err.response?.data === 'string') {
      return err.response.data;
    } else if (err.message) {
      return err.message;
    }
    return 'Erreur inconnue';
  };

  // ===== TOUS LES HANDLERS =====
  const handleContactNameChange = useCallback((e) => setNewContact(prev => ({...prev, name: e.target.value})), []);
  const handleContactEmailChange = useCallback((e) => setNewContact(prev => ({...prev, email: e.target.value})), []);
  const handleContactPhoneChange = useCallback((e) => setNewContact(prev => ({...prev, phone: e.target.value})), []);
  const handleContactCityChange = useCallback((e) => setNewContact(prev => ({...prev, city: e.target.value})), []);
  const handleContactTypeChange = useCallback((e) => setNewContact(prev => ({...prev, type: e.target.value})), []);
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
    console.log('FETCH CONTACTS APPELÉE');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/prospects`, { headers: { 'Authorization': `Bearer ${token}` } });
      setContacts(res.data.map(p => ({ id: p.id, name: p.nom, email: p.email, phone: p.telephone, city: p.ville, type: "Prospect", status: p.statut || p.status || "Active" })));
    } catch (err) { console.error("Erreur fetch:", err); }
  };

  const addContactAPI = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/prospects`, { nom: contact.name, email: contact.email, telephone: contact.phone, ville: contact.city, secteur: "", source: "crm", score: 0, email_valide: false }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
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
    setNewContact({ name: '', email: '', phone: '', type: 'Prospect', city: '', status: 'Active' });
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
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setSettingsMessage('❌ Erreur: ' + errorMsg);
    }
  };

  const handleTestSmtp = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settings/smtp/test`, smtpConfig, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setSettingsMessage('✅ Email test envoyé!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setSettingsMessage('❌ Erreur: ' + errorMsg);
    }
  };

  const handleSaveImap = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settings/imap`, imapConfig, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setSettingsMessage('✅ IMAP configuré!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setSettingsMessage('❌ Erreur: ' + errorMsg);
    }
  };

  const handleSyncImap = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/settings/imap/sync`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      setSettingsMessage('✅ ' + res.data.count + ' emails synchronisés!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setSettingsMessage('❌ Erreur: ' + errorMsg);
    }
  };

  const handleSaveApis = async () => {
    try {
      const token = localStorage.getItem('token');
      if (apisConfig.googlePlaces) {
        await axios.post(`${API_URL}/settings/api`, { api_name: 'google_places', config: { api_key: apisConfig.googlePlaces, enabled: true } }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      }
      if (apisConfig.openai) {
        await axios.post(`${API_URL}/settings/api`, { api_name: 'openai', config: { api_key: apisConfig.openai, enabled: true } }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      }
      setSettingsMessage('✅ APIs configurées!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setSettingsMessage('❌ Erreur: ' + errorMsg);
    }
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard': return <Dashboard stats={stats} opportunities={opportunities} activities={activities} />;
      case 'contacts': return <ContactsModule contacts={contacts} newContact={newContact} editingContact={editingContact} showContactForm={showContactForm} handleContactNameChange={handleContactNameChange} handleContactEmailChange={handleContactEmailChange} handleContactPhoneChange={handleContactPhoneChange} handleContactCityChange={handleContactCityChange} handleContactTypeChange={handleContactTypeChange} handleContactStatusChange={handleContactStatusChange} handleAddContact={handleAddContact} handleEditContact={handleEditContact} handleDeleteContact={handleDeleteContact} setShowContactForm={setShowContactForm} setEditingContact={setEditingContact} setNewContact={setNewContact} />;
      case 'opportunities': return <OpportunitiesModule opportunities={opportunities} newOpportunity={newOpportunity} editingOpportunity={editingOpportunity} showOpportunityForm={showOpportunityForm} handleOpportunityTitleChange={handleOpportunityTitleChange} handleOpportunityCompanyChange={handleOpportunityCompanyChange} handleOpportunityAmountChange={handleOpportunityAmountChange} handleOpportunityExpectedCloseChange={handleOpportunityExpectedCloseChange} handleOpportunityStageChange={handleOpportunityStageChange} handleOpportunityProbabilityChange={handleOpportunityProbabilityChange} handleAddOpportunity={handleAddOpportunity} handleEditOpportunity={handleEditOpportunity} handleDeleteOpportunity={handleDeleteOpportunity} setShowOpportunityForm={setShowOpportunityForm} setEditingOpportunity={setEditingOpportunity} setNewOpportunity={setNewOpportunity} />;
      case 'activities': return <ActivitiesModule activities={activities} newActivity={newActivity} editingActivity={editingActivity} showActivityForm={showActivityForm} handleActivityTypeChange={handleActivityTypeChange} handleActivityContactChange={handleActivityContactChange} handleActivityDescriptionChange={handleActivityDescriptionChange} handleActivityDateChange={handleActivityDateChange} handleActivityResultChange={handleActivityResultChange} handleAddActivity={handleAddActivity} handleEditActivity={handleEditActivity} handleDeleteActivity={handleDeleteActivity} setShowActivityForm={setShowActivityForm} setEditingActivity={setEditingActivity} setNewActivity={setNewActivity} />;
      case 'campaigns': return <CampaignsModule campaigns={campaigns} newCampaign={newCampaign} editingCampaign={editingCampaign} showCampaignForm={showCampaignForm} handleCampaignNameChange={handleCampaignNameChange} handleCampaignTypeChange={handleCampaignTypeChange} handleCampaignStatusChange={handleCampaignStatusChange} handleCampaignContactsChange={handleCampaignContactsChange} handleCampaignSentChange={handleCampaignSentChange} handleCampaignOpenedChange={handleCampaignOpenedChange} handleAddCampaign={handleAddCampaign} handleEditCampaign={handleEditCampaign} handleDeleteCampaign={handleDeleteCampaign} setShowCampaignForm={setShowCampaignForm} setEditingCampaign={setEditingCampaign} setNewCampaign={setNewCampaign} />;
      case 'reports': return <ReportsModule opportunities={opportunities} contacts={contacts} />;
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
          {[{ id: 'dashboard', label: 'Dashboard', icon: '📊' }, { id: 'contacts', label: 'Contacts', icon: '👥' }, { id: 'opportunities', label: 'Opportunités', icon: '🤝' }, { id: 'activities', label: 'Activités', icon: '📋' }, { id: 'campaigns', label: 'Campagnes', icon: '📢' }, { id: 'reports', label: 'Rapports', icon: '📈' }, { id: 'settings', label: 'Settings', icon: '⚙️' }].map((item) => (
            <button key={item.id} onClick={() => setCurrentModule(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentModule === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentModule === 'dashboard' ? 'Dashboard' : currentModule === 'contacts' ? 'Gestion des Contacts' : currentModule === 'opportunities' ? 'Pipeline de Vente' : currentModule === 'activities' ? 'Activités' : currentModule === 'campaigns' ? 'Campagnes Marketing' : currentModule === 'reports' ? 'Rapports & Analytics' : 'Settings'}</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans votre CRM professionnel</p>
        </div>
        <div className="flex-1 overflow-auto p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default CRM;