import { api } from './api';

export interface AdminRoundBrief {
  round_number: number;
  status: string;
  participants: number;
  scheduled_at: string;
}

export interface AdminStatsResponse {
  registered_users: number;
  verified_users: number;
  completed_surveys: number;
  total_rounds: number;
  total_matches: number;
  successful_matches: number;
  match_success_rate: number;
  avg_match_score: number;
  current_round: AdminRoundBrief | null;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  email_verified: boolean;
  role: string;
  created_at: string;
  has_profile: boolean;
  has_survey: boolean;
}

export interface AdminUserListResponse {
  list: AdminUserListItem[];
  total: number;
  page: number;
  size: number;
}

export interface AdminSimulateParticipant {
  user_id: string;
  email: string;
  nickname: string;
}

export interface AdminSimulateResponse {
  round_id: string;
  total_participants: number;
  matched_pairs: number;
  success_rate: number;
  avg_score: number;
  time_cost_ms: number;
  participants?: AdminSimulateParticipant[];
}

export const adminApi = {
  getStats: async (): Promise<AdminStatsResponse> => {
    return await api.get('/admin/stats');
  },
  
  getUsers: async (page: number = 1, size: number = 20): Promise<AdminUserListResponse> => {
    return await api.get('/admin/users', { params: { page, size } });
  },

  triggerMatchRound: async (roundId: string = 'current'): Promise<void> => {
    return await api.post(`/admin/rounds/${roundId}/trigger`);
  },

  simulateMatchRound: async (roundId: string = 'current'): Promise<AdminSimulateResponse> => {
    return await api.post(`/admin/rounds/${roundId}/simulate`);
  }
};
