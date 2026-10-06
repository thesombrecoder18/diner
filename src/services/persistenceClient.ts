import { API_URL, IS_LOCAL_DEMO_MODE, PERSISTENCE_MODE, type PersistenceMode } from '../config/persistence';

export interface User {
  id: number;
  username: string;
}

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

export interface DashboardStats {
  totalVotes: number;
  totalCandidates: number;
  kingsCount: number;
  queensCount: number;
  votingActive: boolean;
}

export interface VoteStats {
  totalVotes: number;
  uniqueVoters: number;
  lastVoteTime: string | null;
}

interface DemoState {
  admins: Array<User & { password: string }>;
  sessionUserId: number | null;
  candidates: Candidate[];
  votes: Array<{
    id: number;
    voterId: string;
    king_id: number;
    queen_id: number;
    created_at: string;
  }>;
  votingActive: boolean;
  nextCandidateId: number;
  nextVoteId: number;
}

const DEMO_STORAGE_KEY = 'diner-demo-state';
const DEMO_VOTER_KEY = 'diner-demo-voter-id';

const DEMO_ACCOUNTS = [{ username: 'admin', password: 'admin123' }] as const;

const DEFAULT_KING_IMAGE = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800';
const DEFAULT_QUEEN_IMAGE = 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800';

const buildInitialDemoState = (): DemoState => ({
  admins: DEMO_ACCOUNTS.map((account, index) => ({
    id: index + 1,
    username: account.username,
    password: account.password,
  })),
  sessionUserId: null,
  candidates: [
    { id: 1, name: 'Koffi Mensah', gender: 'king', image_url: DEFAULT_KING_IMAGE },
    { id: 2, name: 'Yao Bamba', gender: 'king', image_url: DEFAULT_KING_IMAGE },
    { id: 3, name: 'Armand Tano', gender: 'king', image_url: DEFAULT_KING_IMAGE },
    { id: 4, name: 'Kevin Adou', gender: 'king', image_url: DEFAULT_KING_IMAGE },
    { id: 5, name: 'Awa Traoré', gender: 'queen', image_url: DEFAULT_QUEEN_IMAGE },
    { id: 6, name: 'Nadia Kouamé', gender: 'queen', image_url: DEFAULT_QUEEN_IMAGE },
    { id: 7, name: 'Mylène Konan', gender: 'queen', image_url: DEFAULT_QUEEN_IMAGE },
    { id: 8, name: 'Prisca N' + "'" + 'Guessan', gender: 'queen', image_url: DEFAULT_QUEEN_IMAGE },
  ],
  votes: [
    { id: 1, voterId: 'seed-voter-1', king_id: 1, queen_id: 5, created_at: '2026-01-15T20:01:00.000Z' },
    { id: 2, voterId: 'seed-voter-2', king_id: 2, queen_id: 6, created_at: '2026-01-15T20:05:00.000Z' },
    { id: 3, voterId: 'seed-voter-3', king_id: 1, queen_id: 5, created_at: '2026-01-15T20:09:00.000Z' },
  ],
  votingActive: true,
  nextCandidateId: 9,
  nextVoteId: 4,
});

const getDemoState = (): DemoState => {
  const rawState = localStorage.getItem(DEMO_STORAGE_KEY);

  if (!rawState) {
    const initialState = buildInitialDemoState();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return JSON.parse(rawState) as DemoState;
  } catch {
    const fallbackState = buildInitialDemoState();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fallbackState));
    return fallbackState;
  }
};

const setDemoState = (state: DemoState) => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
};

const getOrCreateVoterId = () => {
  const existing = localStorage.getItem(DEMO_VOTER_KEY);
  if (existing) {
    return existing;
  }

  const newVoterId = `voter-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(DEMO_VOTER_KEY, newVoterId);
  return newVoterId;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('Unable to convert file to image data.'));
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

const getImageFromFormData = async (formData: FormData, fallbackImage: string) => {
  const uploadedImage = formData.get('image');
  if (uploadedImage instanceof File && uploadedImage.size > 0) {
    return fileToDataUrl(uploadedImage);
  }

  const providedImageUrl = formData.get('imageUrl');
  if (typeof providedImageUrl === 'string' && providedImageUrl.trim()) {
    return providedImageUrl;
  }

  return fallbackImage;
};

const toVoteCounts = (candidates: Candidate[], votes: DemoState['votes'], field: 'king_id' | 'queen_id') => {
  const counts = new Map<number, number>();
  votes.forEach((vote) => {
    const candidateId = vote[field];
    counts.set(candidateId, (counts.get(candidateId) || 0) + 1);
  });

  return candidates
    .filter((candidate) => candidate.gender === (field === 'king_id' ? 'king' : 'queen'))
    .map((candidate) => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      voteCount: counts.get(candidate.id) || 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount);
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const payload = await response.json();
      if (payload?.message && typeof payload.message === 'string') {
        errorMessage = payload.message;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
};

const localClient = {
  async authMe() {
    const state = getDemoState();
    if (!state.sessionUserId) {
      throw new Error('Not authenticated');
    }

    const user = state.admins.find((admin) => admin.id === state.sessionUserId);
    if (!user) {
      throw new Error('Not authenticated');
    }

    return { id: user.id, username: user.username } satisfies User;
  },

  async login(username: string, password: string) {
    const state = getDemoState();
    const account = state.admins.find((admin) => admin.username === username && admin.password === password);

    if (!account) {
      throw new Error('Invalid credentials');
    }

    const nextState = { ...state, sessionUserId: account.id };
    setDemoState(nextState);
    return { id: account.id, username: account.username } satisfies User;
  },

  async logout() {
    const state = getDemoState();
    setDemoState({ ...state, sessionUserId: null });
  },

  async getCandidates() {
    return getDemoState().candidates;
  },

  async saveCandidate(formData: FormData, candidateId?: number) {
    const state = getDemoState();
    const name = String(formData.get('name') || '').trim();
    const gender = formData.get('gender');

    if (!name || (gender !== 'king' && gender !== 'queen')) {
      throw new Error('Invalid candidate data');
    }

    if (candidateId) {
      const existingCandidate = state.candidates.find((candidate) => candidate.id === candidateId);
      if (!existingCandidate) {
        throw new Error('Candidate not found');
      }

      const image = await getImageFromFormData(formData, existingCandidate.image_url);
      const updatedCandidate: Candidate = { ...existingCandidate, name, gender, image_url: image };

      setDemoState({
        ...state,
        candidates: state.candidates.map((candidate) =>
          candidate.id === candidateId ? updatedCandidate : candidate
        ),
      });

      return;
    }

    const image = await getImageFromFormData(
      formData,
      gender === 'king' ? DEFAULT_KING_IMAGE : DEFAULT_QUEEN_IMAGE
    );

    const newCandidate: Candidate = {
      id: state.nextCandidateId,
      name,
      gender,
      image_url: image,
    };

    setDemoState({
      ...state,
      candidates: [...state.candidates, newCandidate],
      nextCandidateId: state.nextCandidateId + 1,
    });
  },

  async deleteCandidate(id: number) {
    const state = getDemoState();
    setDemoState({
      ...state,
      candidates: state.candidates.filter((candidate) => candidate.id !== id),
      votes: state.votes.filter((vote) => vote.king_id !== id && vote.queen_id !== id),
    });
  },

  async getVotingSettings() {
    return { votingActive: getDemoState().votingActive };
  },

  async updateVotingSettings(votingActive: boolean) {
    const state = getDemoState();
    setDemoState({ ...state, votingActive });
  },

  async checkHasVoted() {
    const state = getDemoState();
    const voterId = getOrCreateVoterId();
    return { hasVoted: state.votes.some((vote) => vote.voterId === voterId) };
  },

  async submitVote(kingId: number, queenId: number) {
    const state = getDemoState();
    const voterId = getOrCreateVoterId();

    if (!state.votingActive) {
      throw new Error('Voting is not active');
    }

    if (state.votes.some((vote) => vote.voterId === voterId)) {
      throw new Error('You have already voted');
    }

    setDemoState({
      ...state,
      votes: [
        ...state.votes,
        {
          id: state.nextVoteId,
          voterId,
          king_id: kingId,
          queen_id: queenId,
          created_at: new Date().toISOString(),
        },
      ],
      nextVoteId: state.nextVoteId + 1,
    });
  },

  async getVoteResults() {
    const state = getDemoState();
    return {
      kings: toVoteCounts(state.candidates, state.votes, 'king_id'),
      queens: toVoteCounts(state.candidates, state.votes, 'queen_id'),
    };
  },

  async getAdminStats() {
    const state = getDemoState();
    const kingsCount = state.candidates.filter((candidate) => candidate.gender === 'king').length;
    const queensCount = state.candidates.filter((candidate) => candidate.gender === 'queen').length;

    return {
      totalVotes: state.votes.length,
      totalCandidates: state.candidates.length,
      kingsCount,
      queensCount,
      votingActive: state.votingActive,
    } satisfies DashboardStats;
  },

  async getVoteStats() {
    const state = getDemoState();
    const lastVote = state.votes.at(-1);
    const uniqueVoters = new Set(state.votes.map((vote) => vote.voterId)).size;

    return {
      totalVotes: state.votes.length,
      uniqueVoters,
      lastVoteTime: lastVote?.created_at ?? null,
    } satisfies VoteStats;
  },

  async resetVotes() {
    const state = getDemoState();
    setDemoState({ ...state, votes: [], nextVoteId: 1 });
    localStorage.removeItem(DEMO_VOTER_KEY);
  },

  async resetDemoData() {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem(DEMO_VOTER_KEY);
    setDemoState(buildInitialDemoState());
  },
};

const apiClient = {
  async authMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    });
    return parseJsonResponse<User>(response);
  },

  async login(username: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    return parseJsonResponse<User>(response);
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    await parseJsonResponse<{ message: string }>(response);
  },

  async getCandidates() {
    const response = await fetch(`${API_URL}/candidates`);
    return parseJsonResponse<Candidate[]>(response);
  },

  async saveCandidate(formData: FormData, candidateId?: number) {
    const response = await fetch(
      candidateId ? `${API_URL}/candidates/${candidateId}` : `${API_URL}/candidates`,
      {
        method: candidateId ? 'PUT' : 'POST',
        body: formData,
        credentials: 'include',
      }
    );

    await parseJsonResponse<Record<string, unknown>>(response);
  },

  async deleteCandidate(id: number) {
    const response = await fetch(`${API_URL}/candidates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await parseJsonResponse<Record<string, unknown>>(response);
  },

  async getVotingSettings() {
    const response = await fetch(`${API_URL}/settings`);
    return parseJsonResponse<{ votingActive: boolean }>(response);
  },

  async updateVotingSettings(votingActive: boolean) {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ votingActive }),
    });
    await parseJsonResponse<Record<string, unknown>>(response);
  },

  async checkHasVoted() {
    const response = await fetch(`${API_URL}/votes/check`);
    return parseJsonResponse<{ hasVoted: boolean }>(response);
  },

  async submitVote(kingId: number, queenId: number) {
    const response = await fetch(`${API_URL}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        king_id: kingId,
        queen_id: queenId,
      }),
    });
    await parseJsonResponse<Record<string, unknown>>(response);
  },

  async getVoteResults() {
    const response = await fetch(`${API_URL}/votes/results`);
    return parseJsonResponse<{ kings: VoteCount[]; queens: VoteCount[] }>(response);
  },

  async getAdminStats() {
    const response = await fetch(`${API_URL}/admin/stats`);
    const payload = await parseJsonResponse<{
      totalVotes: number;
      totalCandidates: number;
      totalKings?: number;
      totalQueens?: number;
      kingsCount?: number;
      queensCount?: number;
      votingActive: boolean;
    }>(response);

    return {
      totalVotes: payload.totalVotes,
      totalCandidates: payload.totalCandidates,
      kingsCount: payload.kingsCount ?? payload.totalKings ?? 0,
      queensCount: payload.queensCount ?? payload.totalQueens ?? 0,
      votingActive: payload.votingActive,
    } satisfies DashboardStats;
  },

  async getVoteStats() {
    const response = await fetch(`${API_URL}/votes`, {
      credentials: 'include',
    });
    const votes = await parseJsonResponse<Array<{ user_ip: string; created_at: string }>>(response);
    const uniqueVoters = new Set(votes.map((vote) => vote.user_ip)).size;
    const lastVoteTime = votes.length > 0 ? votes[votes.length - 1].created_at : null;

    return {
      totalVotes: votes.length,
      uniqueVoters,
      lastVoteTime,
    } satisfies VoteStats;
  },

  async resetVotes() {
    const response = await fetch(`${API_URL}/admin/reset-votes`, {
      method: 'POST',
      credentials: 'include',
    });
    await parseJsonResponse<Record<string, unknown>>(response);
  },

  async resetDemoData() {
    throw new Error('Demo data reset is only available in local mode');
  },
};

type ClientType = typeof localClient;

const client: ClientType = IS_LOCAL_DEMO_MODE ? localClient : apiClient;

export const persistenceClient = {
  mode: PERSISTENCE_MODE as PersistenceMode,
  isLocalMode: IS_LOCAL_DEMO_MODE,
  demoAccounts: DEMO_ACCOUNTS,
  ...client,
};
