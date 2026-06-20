// ============================================================
// REMPLACEMENT DU ContactsModule dans App.jsx
// Corrections de performance :
//   1. Suppression du useEffect local (double fetch avec CRM)
//   2. getFilteredContacts() mémoïsé avec useMemo
//   3. Ligne de table isolée dans un composant React.memo
//   4. handleSendEmails stable avec useCallback
// ============================================================

import React, { useState, useMemo, useCallback, memo } from 'react';

// ── Composant ligne isolé pour éviter le re-render de toute la table ──
const ContactRow = memo(({ contact, isSelected, onToggle, onEdit, onDelete, getSecteurInfo }) => {
  const secteurInfo = getSecteurInfo(contact.secteur);
  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(contact.id)}
        />
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
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold
          ${contact.score >= 90 ? 'bg-green-100 text-green-800' :
            contact.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
            contact.score >= 50 ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-600'}`}>
          {contact.score !== undefined && contact.score !== null ? contact.score : '—'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
          {contact.source || '—'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {contact.status === 'Active' ? 'Actif' : contact.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm space-x-3">
        <button onClick={() => onEdit(contact)} className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1">
          Modifier
        </button>
        <button onClick={() => onDelete(contact.id)} className="text-red-600 hover:text-red-800 font-bold inline-flex items-center gap-1">
          Supprimer
        </button>
      </td>
    </tr>
  );
});

// ── Module principal Contacts ──────────────────────────────────────────
const ContactsModule = ({
  contacts,
  setContacts,
  newContact,
  editingContact,
  showContactForm,
  handleContactNameChange,
  handleContactEmailChange,
  handleContactPhoneChange,
  handleContactCityChange,
  handleContactSecteurChange,
  handleContactStatusChange,
  handleAddContact,
  handleEditContact,
  handleDeleteContact,
  setShowContactForm,
  setEditingContact,
  setNewContact,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const ESTABLISHMENT_TYPES = {
    hotel:                  { name: 'Hôtel',                 icon: Building,  badge: 'bg-blue-100 text-blue-800',   border: 'border-blue-300'   },
    riad:                   { name: 'Riad',                  icon: Home,      badge: 'bg-amber-100 text-amber-800', border: 'border-amber-300'  },
    'transport touristique':{ name: 'Transport touristique', icon: Bus,       badge: 'bg-green-100 text-green-800', border: 'border-green-300'  },
    'agence de voyage':     { name: 'Agence de voyage',      icon: Plane,     badge: 'bg-purple-100 text-purple-800',border:'border-purple-300' },
    'tour operator':        { name: 'Tour Operator',         icon: Backpack,  badge: 'bg-orange-100 text-orange-800',border:'border-orange-300' },
  };

  // Stable — ne dépend que de ESTABLISHMENT_TYPES (constant)
  const getSecteurInfo = useCallback((secteur) => {
    if (!secteur) return { name: 'Non défini', icon: MapPin, badge: 'bg-gray-100 text-gray-800', border: 'border-gray-300' };
    return ESTABLISHMENT_TYPES[secteur.toLowerCase().trim()] || { name: secteur, icon: MapPin, badge: 'bg-gray-100 text-gray-800', border: 'border-gray-300' };
  }, []);

  // ── Filtrage mémoïsé : ne recalcule que si contacts/filtres changent ──
  const filteredContacts = useMemo(() => {
    const search = searchText.toLowerCase();
    return contacts.filter(c => {
      if (search && !c.name.toLowerCase().includes(search) && !c.email.toLowerCase().includes(search) && !(c.source || '').toLowerCase().includes(search)) return false;
      if (filterCity && c.city !== filterCity) return false;
      if (filterSecteur && (c.secteur || '').toLowerCase() !== filterSecteur.toLowerCase()) return false;
      return true;
    });
  }, [contacts, searchText, filterCity, filterSecteur]);

  // ── Listes dérivées mémoïsées ──────────────────────────────────────
  const availableCities = useMemo(() => [...new Set(contacts.map(c => c.city).filter(Boolean))].sort(), [contacts]);
  const secteurs        = useMemo(() => [...new Set(contacts.map(c => c.secteur).filter(Boolean))].sort(), [contacts]);
  const selectedSet     = useMemo(() => new Set(selectedContacts), [selectedContacts]);

  // ── Handlers stables ───────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelectedContacts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedContacts(prev =>
      prev.length === filteredContacts.length ? [] : filteredContacts.map(c => c.id)
    );
  }, [filteredContacts]);

  const handleResetFilters = useCallback(() => {
    setSearchText('');
    setFilterCity('');
    setFilterSecteur('');
  }, []);

  const handleSendEmails = useCallback(async () => {
    if (selectedContacts.length === 0) { alert("Sélectionnez au moins un contact"); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:8000/campagnes/envoyer-selection', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_ids: selectedContacts }),
      });
      const data = await res.json();
      if (data.echecs > 0 && data.envoyes === 0) alert(`❌ Échec total : aucun email envoyé.`);
      else if (data.echecs > 0) alert(`✅ ${data.envoyes} envoyé(s), ${data.echecs} échec(s).`);
      else alert(`✅ ${data.envoyes} email(s) envoyé(s) !`);
      setSelectedContacts([]);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l'envoi.");
    }
  }, [selectedContacts]);

  // NOTE : le useEffect local qui appelait l'API a été supprimé.
  // Les contacts sont chargés une seule fois dans le composant CRM parent
  // via fetchContacts() dans son propre useEffect — pas besoin de le répéter ici.

  const hasActiveFilters = searchText || filterCity || filterSecteur;
  const allFilteredSelected = filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length;

  return (
    <div className="space-y-5">
      {/* ── En-tête ── */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Contacts</h2>
        <div className="flex gap-2 flex-wrap">
          {selectedContacts.length > 0 && (
            <button onClick={handleSendEmails} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2">
              Envoyer email ({selectedContacts.length})
            </button>
          )}
          <button
            onClick={() => { setShowContactForm(true); setEditingContact(null); setNewContact({ name:'', email:'', phone:'', secteur:'', city:'', status:'Active' }); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            + Nouveau Contact
          </button>
        </div>
      </div>

      {/* ── Formulaire ── */}
      {showContactForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">{editingContact ? 'Modifier le Contact' : 'Ajouter un Contact'}</h3>
          <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text"  placeholder="Nom"        value={newContact.name}    onChange={handleContactNameChange}    className="p-2 border border-gray-300 rounded-lg" required />
            <input type="email" placeholder="Email"      value={newContact.email}   onChange={handleContactEmailChange}   className="p-2 border border-gray-300 rounded-lg" required />
            <input type="tel"   placeholder="Téléphone"  value={newContact.phone}   onChange={handleContactPhoneChange}   className="p-2 border border-gray-300 rounded-lg" />
            <input type="text"  placeholder="Ville"      value={newContact.city}    onChange={handleContactCityChange}    className="p-2 border border-gray-300 rounded-lg" />
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

      {/* ── Filtres ── */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Recherchez par nom ou email…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
            <option value="">Toutes les villes ({availableCities.length})</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city} ({contacts.filter(c => c.city === city).length})</option>
            ))}
          </select>
          <select value={filterSecteur} onChange={e => setFilterSecteur(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
            <option value="">Tous les secteurs ({contacts.length})</option>
            {secteurs.map(s => {
              const info = getSecteurInfo(s);
              return <option key={s} value={s}>{info.name} ({contacts.filter(c => c.secteur === s).length})</option>;
            })}
          </select>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Filtres :</strong>
              {searchText && ` "${searchText}"`}
              {filterCity && ` • ${filterCity}`}
              {filterSecteur && ` • ${getSecteurInfo(filterSecteur).name}`}
            </p>
            <button onClick={handleResetFilters} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h3 className="font-bold text-gray-800">
            {hasActiveFilters
              ? `${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''} filtrés`
              : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} au total`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input type="checkbox" onChange={selectAll} checked={allFilteredSelected} />
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Secteur</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ville</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Score</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Source</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedSet.has(contact.id)}
                  onToggle={toggleSelect}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                  getSecteurInfo={getSecteurInfo}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactsModule;