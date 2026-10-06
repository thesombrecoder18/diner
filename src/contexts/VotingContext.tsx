import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { persistenceClient, type Candidate, type VoteCount } from '../services/persistenceClient';

export type { Candidate, VoteCount } from '../services/persistenceClient';

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
      const { votingActive } = await persistenceClient.getVotingSettings();
      setVotingActive(votingActive);
    } catch (err) {
      console.error('Error fetching voting status:', err);
      setError('Failed to get voting status');
    }
  };

  const refreshCandidates = async () => {
    try {
      const data = await persistenceClient.getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates');
    }
  };

  const refreshResults = async () => {
    try {
      const data = await persistenceClient.getVoteResults();
      setKingResults(data.kings);
      setQueenResults(data.queens);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    }
  };

  const checkUserVoteStatus = async () => {
    try {
      const { hasVoted } = await persistenceClient.checkHasVoted();
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
      await persistenceClient.submitVote(selectedKing, selectedQueen);
      
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