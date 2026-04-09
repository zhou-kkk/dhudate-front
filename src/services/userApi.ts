import { api } from './api';

export interface ProfileResponse {
  nickname: string;
  gender: string;
  birth_year: number;
  grade: string;
  college: string;
  major: string;
  bio: string;
  mbti: string;
  match_mode: string;
  updated_at?: string;
}

export interface UserMeResponse {
  id: string;
  email: string;
  email_verified: boolean;
  role: string;
  profile?: ProfileResponse;
}

export const userApi = {
  getMe: async (): Promise<UserMeResponse> => {
    return await api.get('/user/me');
  },
  updateProfile: async (data: Partial<ProfileResponse>): Promise<void> => {
    return await api.put('/user/profile', data);
  }
};
