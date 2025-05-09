import React, { useState, useEffect } from 'react';
import { useVoting } from '../../contexts/VotingContext';
import { AlertCircle, CheckCircle, Timer, BarChart3, RefreshCw, Lock, Unlock } from 'lucide-react';
import { API_URL } from '../../config/constants';

const VotingSettings: React.FC = () => {
  const { votingActive, refreshResults } = useVoting();
  
  const [isVotingActive, setIsVotingActive] = useState(votingActive);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalVotes: 0,
    uniqueVoters: 0,
    lastVoteTime: null as string | null
  });
  const [confirmReset, setConfirmReset] = useState(false);
  
  // Load current settings on mount
  useEffect(() => {
    setIsVotingActive(votingActive);
    fetchVoteStats();
  }, [votingActive]);
  
  // Fetch vote statistics
  const fetchVoteStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/vote-stats`, {
        credentials: 'include',
      });
      console.log('Vote stats response:', response);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching vote stats:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle voting status
  const toggleVotingStatus = async () => {
    setStatusLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const newStatus = !isVotingActive;
      
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ votingActive: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update voting status');
      }
      
      setIsVotingActive(newStatus);
      setSuccess(`Vote ${newStatus ? 'activé' : 'désactivé'} avec succès!`);
      
      // Auto-dismiss success message
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update voting status');
    } finally {
      setStatusLoading(false);
    }
  };
  
  // Reset all votes
  const resetAllVotes = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_URL}/admin/reset-votes`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset votes');
      }
      
      await refreshResults();
      await fetchVoteStats();
      setSuccess('Tous les votes ont été réinitialisés avec succès!');
      setConfirmReset(false);
      
      // Auto-dismiss success message
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset votes');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel reset confirmation
  const cancelReset = () => {
    setConfirmReset(false);
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold mb-2">Paramètres de Vote</h1>
        <p className="text-elegant-400">
          Contrôlez l'état du vote et gérez les paramètres de l'élection
        </p>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-md mb-8 flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-800 text-white p-4 rounded-md mb-8 flex items-center">
          <CheckCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
      
      {/* Voting Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-elegant-900 rounded-lg p-6">
          <h2 className="text-xl font-playfair font-bold mb-6 flex items-center">
            <Timer size={22} className="mr-2 text-gold-500" />
            État du Vote
          </h2>
          
          <div className={`p-4 rounded-lg mb-6 ${isVotingActive ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
            <div className="flex items-center">
              {isVotingActive ? (
                <Unlock size={24} className="text-green-500 mr-2" />
              ) : (
                <Lock size={24} className="text-red-500 mr-2" />
              )}
              <div>
                <p className="font-medium">
                  Le vote est actuellement <span className={isVotingActive ? 'text-green-500' : 'text-red-500'}>
                    {isVotingActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                  </span>
                </p>
                <p className="text-sm text-elegant-400 mt-1">
                  {isVotingActive 
                    ? 'Les utilisateurs peuvent voter pour le Roi et la Reine'
                    : 'Les utilisateurs ne peuvent pas voter actuellement'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={toggleVotingStatus}
              disabled={statusLoading}
              className={`btn py-3 px-6 flex items-center ${
                isVotingActive 
                  ? 'bg-red-900 hover:bg-red-800 text-white' 
                  : 'bg-green-900 hover:bg-green-800 text-white'
              }`}
            >
              {statusLoading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  <span>Mise à jour...</span>
                </>
              ) : isVotingActive ? (
                <>
                  <Lock size={18} className="mr-2" />
                  <span>Désactiver le vote</span>
                </>
              ) : (
                <>
                  <Unlock size={18} className="mr-2" />
                  <span>Activer le vote</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Voting Statistics */}
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-playfair font-bold flex items-center">
              <BarChart3 size={22} className="mr-2 text-gold-500" />
              Statistiques de Vote
            </h2>
            
            <button 
              onClick={fetchVoteStats}
              disabled={loading}
              className="text-elegant-400 hover:text-gold-500"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-elegant-800 p-4 rounded-lg">
              <p className="text-elegant-400 text-sm">Votes Totaux</p>
              <p className="text-2xl font-playfair mt-1">{stats.totalVotes}</p>
            </div>
            
            <div className="bg-elegant-800 p-4 rounded-lg">
              <p className="text-elegant-400 text-sm">Électeurs Uniques</p>
              <p className="text-2xl font-playfair mt-1">{stats.uniqueVoters}</p>
            </div>
            
            <div className="bg-elegant-800 p-4 rounded-lg">
              <p className="text-elegant-400 text-sm">Dernier Vote</p>
              <p className="text-lg font-playfair mt-1">
                {stats.lastVoteTime 
                  ? new Date(stats.lastVoteTime).toLocaleString('fr-FR')
                  : 'Aucun vote enregistré'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Settings */}
      <div className="bg-elegant-900 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-playfair font-bold mb-6">Paramètres Avancés</h2>
        
        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
          <h3 className="font-bold flex items-center">
            <AlertCircle size={18} className="text-red-500 mr-2" />
            Réinitialisation des votes
          </h3>
          <p className="text-elegant-400 text-sm mt-2 mb-4">
            Cette action supprimera définitivement tous les votes. Cette opération est irréversible.
          </p>
          
          {!confirmReset ? (
            <button
              onClick={resetAllVotes}
              className="btn bg-red-900 hover:bg-red-800 text-white"
            >
              Réinitialiser tous les votes
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={resetAllVotes}
                disabled={loading}
                className="btn bg-red-700 hover:bg-red-600 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    <span>Réinitialisation...</span>
                  </>
                ) : (
                  'Confirmer la réinitialisation'
                )}
              </button>
              <button
                onClick={cancelReset}
                disabled={loading}
                className="btn bg-elegant-800 hover:bg-elegant-700"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingSettings;