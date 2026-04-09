import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerItem } from '../services/survey';

interface SurveyState {
  localAnswers: Record<string, string>; // { question_id: answer }
  setAnswer: (questionId: string, answer: string) => void;
  loadFromServerAnswers: (answers: AnswerItem[]) => void;
  clearLocalAnswers: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      localAnswers: {},
      
      setAnswer: (questionId, answer) => 
        set((state) => ({
          localAnswers: { ...state.localAnswers, [questionId]: answer }
        })),
        
      loadFromServerAnswers: (answers) => 
        set(() => {
          const map: Record<string, string> = {};
          answers.forEach(a => map[a.question_id] = a.answer);
          return { localAnswers: map };
        }),
        
      clearLocalAnswers: () => set({ localAnswers: {} })
    }),
    {
      name: 'dhudate-survey-progress', // 本地暂存答题进度防丢失
    }
  )
);
