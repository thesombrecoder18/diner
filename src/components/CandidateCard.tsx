import React from 'react';
import { Crown } from 'lucide-react';
import { Candidate } from '../contexts/VotingContext';

interface CandidateCardProps {
  candidate: Candidate;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  selected, 
  onClick,
  disabled = false
}) => {
  return (
    <div 
      className={`card relative cursor-pointer transform transition-all duration-300 ${
        selected 
          ? 'ring-2 ring-gold-500 scale-105' 
          : 'hover:scale-102'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {selected && (
        <div className="absolute -top-3 -right-3 bg-gold-500 text-elegant-950 rounded-full p-1 z-10 animate-pulse-gold">
          <Crown size={20} className="text-elegant-950" />
        </div>
      )}
      
      <div className="h-64 overflow-hidden">
        <img 
          src={candidate.image_url} 
          alt={candidate.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      
      <div className="p-4 bg-gradient-to-t from-elegant-950 to-elegant-900">
        <h3 className="font-playfair text-xl font-bold text-white mb-1">{candidate.name}</h3>
        <p className="text-sm text-elegant-300 uppercase tracking-wider">
          {candidate.gender === 'king' ? 'Candidat Roi' : 'Candidate Reine'}
        </p>
        
        <button 
          className={`mt-3 w-full py-2 rounded-md transition-colors duration-300 ${
            selected 
              ? 'bg-gold-500 text-elegant-950 font-medium' 
              : 'bg-burgundy-950 text-white hover:bg-burgundy-900'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          {selected ? 'Sélectionné' : 'Choisir'}
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;