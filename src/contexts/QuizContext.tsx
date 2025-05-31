"use client";

import type React from 'react';
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { QuizState, QuizAction, UserAnswer } from '@/types/quiz';
import { shuffleArray, checkAnswerCorrectness } from '@/lib/quizUtils';

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: new Map(),
  score: 0,
  quizMode: null,
  timeLeft: 0, // Default, will be set on quiz start
  isQuizActive: false,
  isQuizCompleted: false,
  examConfig: {
    totalQuestions: 125, // CEH standard
    durationMinutes: 240, // 4 hours
  },
};

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  checkAnswer: (questionId: string, answer: string | string[] | boolean) => boolean;
  submitAndShowAnswer: (questionId: string, answer: string | string[] | boolean) => void;
} | undefined>(undefined);

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ': {
      const { questions, mode, config } = action.payload;
      const newExamConfig = { ...state.examConfig, ...config };
      let quizQuestions = questions;
      let duration = newExamConfig.durationMinutes * 60;

      if (mode === 'exam') {
        quizQuestions = shuffleArray(questions).slice(0, newExamConfig.totalQuestions);
      } else { // practice mode
        duration = 0; // No time limit for practice
      }
      
      return {
        ...initialState, // Reset most state
        examConfig: newExamConfig, // Apply new config
        questions: quizQuestions,
        quizMode: mode,
        timeLeft: duration,
        isQuizActive: true,
        isQuizCompleted: false,
        userAnswers: new Map(), // Ensure userAnswers is reset
      };
    }
    case 'SELECT_ANSWER': {
      const { questionId, answer } = action.payload;
      const newUserAnswers = new Map(state.userAnswers);
      const existingAnswer = newUserAnswers.get(questionId) || { questionId, answer };
      newUserAnswers.set(questionId, { ...existingAnswer, answer });
      return { ...state, userAnswers: newUserAnswers };
    }
    case 'SUBMIT_ANSWER': { // For immediate feedback logic
        const { questionId } = action.payload;
        const question = state.questions.find(q => q.id === questionId);
        const userAnswerEntry = state.userAnswers.get(questionId);

        if (!question || !userAnswerEntry) return state;

        const isCorrect = checkAnswerCorrectness(question, userAnswerEntry.answer);
        const newUserAnswers = new Map(state.userAnswers);
        newUserAnswers.set(questionId, { ...userAnswerEntry, isCorrect });
        
        // Update score if it's the first time submitting this answer correctly
        // This needs refinement if answers can be changed and re-submitted.
        // For now, assume score is calculated at the end or upon first correct submission.
        // To avoid double counting if score is also calculated via SUBMIT_ALL_ANSWERS.
        // A simple approach: if in practice mode and answer is correct, increment score.
        let newScore = state.score;
        if (state.quizMode === 'practice' && isCorrect && userAnswerEntry.isCorrect === undefined) { // only add score if not previously marked
             newScore = state.score + 1;
        }

        return { ...state, userAnswers: newUserAnswers, score: newScore };
    }
    case 'SUBMIT_ALL_ANSWERS': {
      let newScore = 0;
      const updatedUserAnswers = new Map<string, UserAnswer>();
      state.questions.forEach(q => {
        const userAnswer = state.userAnswers.get(q.id);
        if (userAnswer) {
          const isCorrect = checkAnswerCorrectness(q, userAnswer.answer);
          if (isCorrect) {
            newScore++;
          }
          updatedUserAnswers.set(q.id, { ...userAnswer, isCorrect });
        } else {
          // Mark unanswered questions explicitly if needed
           updatedUserAnswers.set(q.id, { questionId: q.id, answer: '', isCorrect: false });
        }
      });
      return { ...state, score: newScore, userAnswers: updatedUserAnswers, isQuizCompleted: true, isQuizActive: false };
    }
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state; // Or handle quiz completion
    case 'PREV_QUESTION':
      if (state.currentQuestionIndex > 0) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload };
    case 'COMPLETE_QUIZ':
      return { ...state, isQuizActive: false, isQuizCompleted: true, quizMode: 'summary' };
    case 'RESET_QUIZ':
      return {...initialState, examConfig: state.examConfig }; // Keep current config but reset quiz
    default:
      return state;
  }
}

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const checkAnswer = useCallback((questionId: string, answer: string | string[] | boolean): boolean => {
    const question = state.questions.find(q => q.id === questionId);
    if (!question) return false;
    return checkAnswerCorrectness(question, answer);
  }, [state.questions]);

  const submitAndShowAnswer = useCallback((questionId: string, answer: string | string[] | boolean): void => {
    dispatch({ type: 'SELECT_ANSWER', payload: { questionId, answer } });
    // Defer submission slightly to ensure state update from SELECT_ANSWER is processed
    // Or, combine logic if reducer handles it well.
    // For now, SUBMIT_ANSWER will read the latest from state.userAnswers after SELECT_ANSWER.
    dispatch({ type: 'SUBMIT_ANSWER', payload: { questionId } });
  }, [dispatch]);


  useEffect(() => {
    if (state.isQuizActive && state.quizMode === 'exam' && state.timeLeft > 0) {
      const timerId = setInterval(() => {
        dispatch({ type: 'SET_TIME_LEFT', payload: state.timeLeft - 1 });
      }, 1000);
      return () => clearInterval(timerId);
    } else if (state.isQuizActive && state.quizMode === 'exam' && state.timeLeft === 0) {
      dispatch({ type: 'SUBMIT_ALL_ANSWERS' });
      dispatch({ type: 'COMPLETE_QUIZ' });
    }
  }, [state.isQuizActive, state.quizMode, state.timeLeft]);

  return (
    <QuizContext.Provider value={{ state, dispatch, checkAnswer, submitAndShowAnswer }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
