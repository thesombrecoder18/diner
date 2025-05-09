import React, { useState, useEffect } from 'react';
import { useVoting } from '../contexts/VotingContext';
import ResultsChart from '../components/ResultsChart';
import { Crown, AlertCircle, RefreshCw, BarChart3, PieChart } from 'lucide-react';

const ResultsPage: React.FC = () => {
  const { 
    kingResults, 
    queenResults, 
    loading, 
    error, 
    refreshResults 
  } = useVoting();
  
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Refresh results every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshResults();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshResults]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshResults();
    setRefreshing(false);
  };
  
  if (loading && !refreshing) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-gold-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-elegant-300">Chargement des résultats...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-playfair font-bold mb-4">Résultats des votes</h1>
          <p className="text-lg text-elegant-300 max-w-3xl mx-auto">
            Découvrez en temps réel les résultats du vote pour le Roi et la Reine du DGI DINER.
          </p>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={handleRefresh}
              className="btn btn-outline flex items-center space-x-2"
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
            
            <div className="bg-elegant-900 rounded-lg p-1 flex">
              <button 
                onClick={() => setChartType('pie')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                  chartType === 'pie' 
                    ? 'bg-burgundy-950 text-white' 
                    : 'text-elegant-300'
                }`}
              >
                <PieChart size={18} />
                <span className="hidden sm:inline">Camembert</span>
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                  chartType === 'bar' 
                    ? 'bg-burgundy-950 text-white' 
                    : 'text-elegant-300'
                }`}
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Barres</span>
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-md mb-8 flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ResultsChart 
            title="Résultats des Rois" 
            data={kingResults} 
            type="king"
            chartType={chartType}
          />
          <ResultsChart 
            title="Résultats des Reines" 
            data={queenResults} 
            type="queen"
            chartType={chartType}
          />
        </div>
        
        {/* Winners Section (could be conditionally shown when voting is closed) */}
        {(kingResults.length > 0 && queenResults.length > 0) && (
          <div className="mt-12 p-6 bg-elegant-900 rounded-lg">
            <h2 className="text-2xl font-playfair font-bold mb-6 text-center">
              Résultats actuels
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* King Winner */}
              <div className="text-center">
                <div className="w-20 h-20 bg-burgundy-950 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown size={40} className="text-gold-500" />
                </div>
                <h3 className="text-xl font-playfair font-bold">
                  Roi en tête
                </h3>
                
                {kingResults.length > 0 && (
                  <div className="mt-4">
                    <p className="text-2xl font-playfair text-gold-500">
                      {kingResults[0].candidateName}
                    </p>
                    <p className="text-elegant-300 mt-1">
                      {kingResults[0].voteCount} votes
                    </p>
                  </div>
                )}
              </div>
              
              {/* Queen Winner */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown size={40} className="text-elegant-950" />
                </div>
                <h3 className="text-xl font-playfair font-bold">
                  Reine en tête
                </h3>
                
                {queenResults.length > 0 && (
                  <div className="mt-4">
                    <p className="text-2xl font-playfair text-gold-500">
                      {queenResults[0].candidateName}
                    </p>
                    <p className="text-elegant-300 mt-1">
                      {queenResults[0].voteCount} votes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;