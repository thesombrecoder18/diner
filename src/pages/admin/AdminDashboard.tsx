import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Crown, Settings } from 'lucide-react';
import { useVoting } from '../../contexts/VotingContext';
import ResultsChart from '../../components/ResultsChart';
import { API_URL } from '../../config/constants';

interface DashboardStats {
  totalVotes: number;
  totalCandidates: number;
  kingsCount: number;
  queensCount: number;
  votingActive: boolean;
}

const AdminDashboard: React.FC = () => {
  const { 
    kingResults, 
    queenResults, 
    refreshResults,
    votingActive
  } = useVoting();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalVotes: 0,
    totalCandidates: 0,
    kingsCount: 0,
    queensCount: 0,
    votingActive: false
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/stats`);
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    refreshResults();
  }, [refreshResults]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-gold-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Find top candidates
  const topKing = kingResults.length > 0 ? kingResults[0] : null;
  const topQueen = queenResults.length > 0 ? queenResults[0] : null;
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold mb-2">Tableau de bord</h1>
        <p className="text-elegant-400">
          Aperçu des votes et gestion de l'élection
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-burgundy-950/50 p-3 rounded-lg mr-4">
              <Users size={24} className="text-burgundy-400" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Total Candidats</p>
              <h3 className="text-2xl font-bold">{stats.totalCandidates}</h3>
            </div>
          </div>
          <div className="mt-4 flex text-sm">
            <span className="text-burgundy-500 mr-3">Rois: {stats.kingsCount}</span>
            <span className="text-gold-500">Reines: {stats.queensCount}</span>
          </div>
        </div>
        
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-gold-500/20 p-3 rounded-lg mr-4">
              <BarChart3 size={24} className="text-gold-500" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Votes Totaux</p>
              <h3 className="text-2xl font-bold">{stats.totalVotes}</h3>
            </div>
          </div>
          <div className="mt-4 flex text-sm">
            <span className="text-elegant-400">
              Participation active
            </span>
          </div>
        </div>
        
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-burgundy-950/50 p-3 rounded-lg mr-4">
              <Crown size={24} className="text-burgundy-400" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Roi en tête</p>
              <h3 className="text-xl font-bold truncate">
                {topKing ? topKing.candidateName : 'Aucun vote'}
              </h3>
            </div>
          </div>
          <div className="mt-4 text-sm text-elegant-400">
            {topKing ? `${topKing.voteCount} votes` : 'En attente de votes'}
          </div>
        </div>
        
        <div className="bg-elegant-900 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-gold-500/20 p-3 rounded-lg mr-4">
              <Crown size={24} className="text-gold-500" />
            </div>
            <div>
              <p className="text-elegant-400 text-sm">Reine en tête</p>
              <h3 className="text-xl font-bold truncate">
                {topQueen ? topQueen.candidateName : 'Aucun vote'}
              </h3>
            </div>
          </div>
          <div className="mt-4 text-sm text-elegant-400">
            {topQueen ? `${topQueen.voteCount} votes` : 'En attente de votes'}
          </div>
        </div>
      </div>
      
      {/* Status Card */}
      <div className={`p-6 rounded-lg mb-8 ${votingActive ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
        <div className="flex items-start">
          <div className={`p-3 rounded-full mr-4 ${votingActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <Settings size={24} className={votingActive ? 'text-green-500' : 'text-red-500'} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">
              Statut du vote: {votingActive ? 'Actif' : 'Inactif'}
            </h3>
            <p className="text-elegant-400 mb-4">
              {votingActive 
                ? 'Les utilisateurs peuvent actuellement voter pour le Roi et la Reine.' 
                : 'Le vote est actuellement désactivé. Les utilisateurs ne peuvent pas voter.'}
            </p>
            <Link 
              to="/admin/settings" 
              className="btn btn-outline inline-flex items-center"
            >
              <Settings size={16} className="mr-2" />
              Modifier les paramètres
            </Link>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ResultsChart 
          title="Votes pour le Roi" 
          data={kingResults} 
          type="king"
        />
        <ResultsChart 
          title="Votes pour la Reine" 
          data={queenResults} 
          type="queen"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-elegant-900 rounded-lg p-6">
        <h3 className="text-xl font-playfair font-bold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/candidates" 
            className="bg-elegant-800 hover:bg-elegant-700 p-4 rounded-lg flex items-center"
          >
            <Users size={20} className="text-gold-500 mr-3" />
            <span>Gérer les candidats</span>
          </Link>
          <Link 
            to="/admin/settings" 
            className="bg-elegant-800 hover:bg-elegant-700 p-4 rounded-lg flex items-center"
          >
            <Settings size={20} className="text-gold-500 mr-3" />
            <span>Paramètres du vote</span>
          </Link>
          <button 
            onClick={refreshResults}
            className="bg-elegant-800 hover:bg-elegant-700 p-4 rounded-lg flex items-center"
          >
            <BarChart3 size={20} className="text-gold-500 mr-3" />
            <span>Actualiser les résultats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;