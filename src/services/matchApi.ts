import { api } from './api';

export interface MatchRoundResponse {
  id: string;
  round_number: number;
  scheduled_at: string;
  status: string;
  total_participants: number;
  has_joined: boolean;
}

export interface MatchResultBrief {
  id: string;
  round_number: number;
  score: number;
  status: string; // my status: pending / accepted / rejected
  peer_status: string;
  created_at: string;
}

export interface MatchPeerInfo {
  nickname: string;
  gender: string;
  grade: string;
  college?: string;
  bio?: string;
  mbti?: string;
}

export interface MatchDetailResponse {
  id: string;
  round_number: number;
  score: number;
  dimensions: Record<string, number>;
  reason: string;
  my_status: string;
  peer_status: string;
  peer: MatchPeerInfo;
  created_at: string;
}

export const matchApi = {
  // 轮次
  getCurrentRound: async (): Promise<MatchRoundResponse | null> => {
    try {
      return await api.get('/match/rounds/current');
    } catch {
      return null;
    }
  },
  joinRound: async (): Promise<void> => {
    return await api.post('/match/rounds/current/join');
  },
  quitRound: async (): Promise<void> => {
    return await api.post('/match/rounds/current/quit');
  },

  // 结果
  getResults: async (): Promise<MatchResultBrief[]> => {
    const res: any = await api.get('/match/results');
    return res.list || [];
  },
  getDetail: async (id: string): Promise<MatchDetailResponse> => {
    return await api.get(`/match/results/${id}`);
  },
  accept: async (id: string): Promise<void> => {
    return await api.post(`/match/results/${id}/accept`);
  },
  reject: async (id: string): Promise<void> => {
    return await api.post(`/match/results/${id}/reject`);
  }
};
