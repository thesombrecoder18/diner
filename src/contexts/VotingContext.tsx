import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { API_URL } from '../config/constants';

export interface Candidate {
  id: number;
  name: string;
  gender: 'king' | 'queen';
  image_url: string;
}

export interface VoteCount {
  candidateId: number;
  candidateName: string;
  voteCount: number;
}

interface VotingContextType {
  candidates: Candidate[];
  kings: Candidate[];
  queens: Candidate[];
  votingActive: boolean;
  loading: boolean;
  error: string | null;
  selectedKing: number | null;
  selectedQueen: number | null;
  kingResults: VoteCount[];
  queenResults: VoteCount[];
  hasVoted: boolean;
  setSelectedKing: (id: number | null) => void;
  setSelectedQueen: (id: number | null) => void;
  submitVote: () => Promise<void>;
  refreshCandidates: () => Promise<void>;
  refreshResults: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

interface VotingProviderProps {
  children: ReactNode;
}

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingActive, setVotingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKing, setSelectedKing] = useState<number | null>(null);
  const [selectedQueen, setSelectedQueen] = useState<number | null>(null);
  const [kingResults, setKingResults] = useState<VoteCount[]>([]);
  const [queenResults, setQueenResults] = useState<VoteCount[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  const kings = candidates.filter(c => c.gender === 'king');
  const queens = candidates.filter(c => c.gender === 'queen');

  // Check voting status and load candidates
  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          refreshVotingStatus(),
          refreshCandidates(),
          checkUserVoteStatus(),
          refreshResults()
        ]);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  const refreshVotingStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      
      if (!response.ok) {
        throw new Error('Failed to get voting status');
      }
      
      const { votingActive } = await response.json();
      setVotingActive(votingActive);
    } catch (err) {
      console.error('Error fetching voting status:', err);
      setError('Failed to get voting status');
    }
  };

  const refreshCandidates = async () => {
    try {
      const response = await fetch(`${API_URL}/candidates`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates');
    }
  };

  const refreshResults = async () => {
    try {
      const response = await fetch(`${API_URL}/votes/results`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setKingResults(data.kings);
      setQueenResults(data.queens);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    }
  };

  const checkUserVoteStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/votes/check`);
      
      if (!response.ok) {
        throw new Error('Failed to check vote status');
      }
      
      const { hasVoted } = await response.json();
      setHasVoted(hasVoted);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const submitVote = async () => {
    if (!selectedKing || !selectedQueen) {
      setError('Please select both a King and a Queen');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kingId: selectedKing,
          queenId: selectedQueen,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Voting failed');
      }
      
      setHasVoted(true);
      // Refresh results after voting
      await refreshResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VotingContext.Provider value={{
      candidates,
      kings,
      queens,
      votingActive,
      loading,
      error,
      selectedKing,
      selectedQueen,
      kingResults,
      queenResults,
      hasVoted,
      setSelectedKing,
      setSelectedQueen,
      submitVote,
      refreshCandidates,
      refreshResults,
    }}>
      {children}
    </VotingContext.Provider>
  );
};