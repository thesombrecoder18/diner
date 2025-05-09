import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVoting } from '../contexts/VotingContext';
import CandidateCard from '../components/CandidateCard';
import { Crown, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

const VotingPage: React.FC = () => {
  const { 
    kings, 
    queens, 
    loading, 
    error, 
    selectedKing, 
    selectedQueen, 
    setSelectedKing, 
    setSelectedQueen, 
    submitVote, 
    votingActive,
    hasVoted
  } = useVoting();
  
  const [submitting, setSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  
  const handleVoteSubmit = async () => {
    if (!selectedKing || !selectedQueen) {
      setVoteError('Veuillez sélectionner un Roi et une Reine avant de voter');
      return;
    }
    
    setSubmitting(true);
    setVoteError(null);
    
    try {
      await submitVote();
      setVoteSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Une erreur est survenue lors du vote');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-gold-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-elegant-300">Chargement des candidats...</p>
        </div>
      </div>
    );
  }
  
  if (voteSuccess || hasVoted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-elegant-900 rounded-lg p-8 text-center animate-fade-in">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-playfair font-bold mb-4">Vote enregistré !</h2>
          <p className="text-lg text-elegant-300 mb-6">
            Merci d'avoir participé à l'élection du Roi et de la Reine du DGI DINER.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/results"
              className="btn btn-gold py-3 px-6"
            >
              Voir les résultats
            </Link>
            <Link 
              to="/"
              className="btn btn-outline py-3 px-6"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!votingActive) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-elegant-900 rounded-lg p-8 text-center">
          <Lock size={64} className="text-burgundy-800 mx-auto mb-4" />
          <h2 className="text-3xl font-playfair font-bold mb-4">Vote fermé</h2>
          <p className="text-lg text-elegant-300 mb-6">
            Le vote n'est pas encore ouvert ou a déjà été clôturé.
          </p>
          <Link 
            to="/results"
            className="btn btn-gold py-3 px-6"
          >
            Voir les résultats
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold mb-4">Votez pour le Roi et la Reine</h1>
          <p className="text-lg text-elegant-300 max-w-3xl mx-auto">
            Sélectionnez un candidat Roi et une candidate Reine, puis confirmez votre vote. 
            Vous ne pourrez voter qu'une seule fois.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-md mb-8 flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {voteError && (
          <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-md mb-8 flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{voteError}</p>
          </div>
        )}
        
        {/* Kings Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Crown size={24} className="text-burgundy-950 mr-2" />
            <h2 className="text-2xl font-playfair font-bold">Candidats Roi</h2>
          </div>
          
          {kings.length === 0 ? (
            <p className="text-elegant-400 italic">Aucun candidat disponible</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {kings.map(king => (
                <CandidateCard
                  key={king.id}
                  candidate={king}
                  selected={selectedKing === king.id}
                  onClick={() => setSelectedKing(king.id)}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Queens Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Crown size={24} className="text-gold-500 mr-2" />
            <h2 className="text-2xl font-playfair font-bold">Candidates Reine</h2>
          </div>
          
          {queens.length === 0 ? (
            <p className="text-elegant-400 italic">Aucune candidate disponible</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {queens.map(queen => (
                <CandidateCard
                  key={queen.id}
                  candidate={queen}
                  selected={selectedQueen === queen.id}
                  onClick={() => setSelectedQueen(queen.id)}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Vote Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleVoteSubmit}
            className={`btn btn-gold py-3 px-8 text-lg flex items-center space-x-2 ${
              submitting ? 'opacity-75 cursor-not-allowed' : 'animate-pulse-gold'
            }`}
            disabled={submitting || !selectedKing || !selectedQueen}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-t-2 border-elegant-950 border-solid rounded-full animate-spin mr-2"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Crown size={20} />
                <span>Confirmer mon vote</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;