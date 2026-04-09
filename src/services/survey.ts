import { api } from './api';

export interface Question {
  id: string;
  text: string;
  category: string;
  type: string; // 'likert_scale', 'single_choice', etc.
  options: string; // JSON string array e.g., '["非常不同意","不同意","中立","同意","非常同意"]'
  weight: number;
  order: number;
}

export interface AnswerItem {
  question_id: string;
  answer: string;
}

export interface SurveyStatus {
  total_questions: number;
  answered_questions: number;
  is_completed: boolean;
}

export const surveyService = {
  getQuestions: async (): Promise<Question[]> => {
    return await api.get('/survey/questions');
  },

  getSurveyStatus: async (): Promise<SurveyStatus> => {
    return await api.get('/survey/status');
  },

  getMyAnswers: async (): Promise<AnswerItem[]> => {
    return await api.get('/survey/answers/me');
  },

  submitAnswers: async (answers: AnswerItem[]): Promise<void> => {
    return await api.post('/survey/answers', { answers });
  }
};
