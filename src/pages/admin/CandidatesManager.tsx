import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, AlertCircle, Crown, Search } from 'lucide-react';
import { useVoting, Candidate } from '../../contexts/VotingContext';
import CandidateForm from '../../components/CandidateForm';
import { API_URL } from '../../config/constants';

const CandidatesManager: React.FC = () => {
  const { 
    candidates, 
    kings, 
    queens, 
    refreshCandidates,
    loading: votingLoading 
  } = useVoting();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'king' | 'queen'>('all');
  
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase());
    const matchesGender = filterGender === 'all' || candidate.gender === filterGender;
    return matchesSearch && matchesGender;
  });
  
  const handleAddCandidate = () => {
    setEditingCandidate(null);
    setShowForm(true);
  };
  
  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowForm(true);
  };
  
  const handleSubmitCandidate = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = editingCandidate 
        ? `${API_URL}/candidates/${editingCandidate.id}` 
        : `${API_URL}/candidates`;
      
      const method = editingCandidate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save candidate');
      }
      
      await refreshCandidates();
      setShowForm(false);
      setEditingCandidate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteCandidate = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/candidates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete candidate');
      }
      
      await refreshCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete candidate');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCandidate(null);
  };
  
  if (votingLoading && !loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-gold-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold mb-2">Gestion des Candidats</h1>
          <p className="text-elegant-400">
            Ajoutez, modifiez ou supprimez des candidats pour l'élection
          </p>
        </div>
        
        <button
          onClick={handleAddCandidate}
          className="btn btn-gold mt-4 md:mt-0 flex items-center"
          disabled={loading}
        >
          <PlusCircle size={18} className="mr-2" />
          Ajouter un candidat
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-md mb-8 flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {showForm && (
        <div className="bg-elegant-900 p-6 rounded-lg mb-8 animate-fade-in">
          <h2 className="text-xl font-playfair font-bold mb-4">
            {editingCandidate ? 'Modifier le candidat' : 'Ajouter un candidat'}
          </h2>
          <CandidateForm 
            candidate={editingCandidate || undefined}
            onSubmit={handleSubmitCandidate}
            onCancel={handleCancelForm}
          />
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-elegant-800 p-3 rounded-lg mr-4">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Total Candidats</p>
              <h3 className="text-2xl font-bold">{candidates.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-burgundy-950/50 p-3 rounded-lg mr-4">
              <Crown size={24} className="text-burgundy-400" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Candidats Roi</p>
              <h3 className="text-2xl font-bold">{kings.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-gold-500/20 p-3 rounded-lg mr-4">
              <Crown size={24} className="text-gold-500" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Candidates Reine</p>
              <h3 className="text-2xl font-bold">{queens.length}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-elegant-900 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-elegant-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterGender('all')}
              className={`px-4 py-2 rounded-md ${
                filterGender === 'all' 
                  ? 'bg-burgundy-950 text-white' 
                  : 'bg-elegant-800 text-elegant-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterGender('king')}
              className={`px-4 py-2 rounded-md ${
                filterGender === 'king' 
                  ? 'bg-burgundy-950 text-white' 
                  : 'bg-elegant-800 text-elegant-300'
              }`}
            >
              Rois
            </button>
            <button
              onClick={() => setFilterGender('queen')}
              className={`px-4 py-2 rounded-md ${
                filterGender === 'queen' 
                  ? 'bg-gold-500 text-elegant-950' 
                  : 'bg-elegant-800 text-elegant-300'
              }`}
            >
              Reines
            </button>
          </div>
        </div>
      </div>
      
      {/* Candidates Table */}
      <div className="bg-elegant-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-elegant-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-elegant-300 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-elegant-300 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-elegant-300 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-elegant-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-elegant-800">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-elegant-400 italic">
                    Aucun candidat trouvé
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-elegant-800/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img 
                          src={candidate.image_url} 
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium">{candidate.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.gender === 'king' 
                          ? 'bg-burgundy-950/50 text-burgundy-300' 
                          : 'bg-gold-500/20 text-gold-500'
                      }`}>
                        <Crown size={12} className="mr-1" />
                        {candidate.gender === 'king' ? 'Roi' : 'Reine'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCandidate(candidate)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                        disabled={loading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="text-red-400 hover:text-red-300"
                        disabled={loading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatesManager;