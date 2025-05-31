"use client";

import { useQuiz } from '@/hooks/useQuiz';
import QuestionCard from './QuestionCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LogOut, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import questionsData from '@/data/questions.json'; // All questions
import type { Question } from '@/types/quiz';
import TimerDisplay from '@/components/quiz/TimerDisplay';
import ProgressTracker from './ProgressTracker';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuizDisplayProps {
  mode: "practice" | "exam";
}

export default function QuizDisplay({ mode }: QuizDisplayProps) {
  const { state, dispatch, submitAndShowAnswer } = useQuiz();
  const router = useRouter();
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // Initialize quiz if not already active or if mode mismatches
    if (!state.isQuizActive || state.quizMode !== mode) {
      const typedQuestions = questionsData as Question[];
      dispatch({ type: 'START_QUIZ', payload: { questions: typedQuestions, mode } });
    }
  }, [mode, dispatch, state.isQuizActive, state.quizMode]);
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);


  if (!state.isQuizActive || state.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <PlayCircle className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <p className="text-xl text-muted-foreground">Loading quiz...</p>
        <Button onClick={() => {
          const typedQuestions = questionsData as Question[];
          dispatch({ type: 'START_QUIZ', payload: { questions: typedQuestions, mode } });
        }} className="mt-4">
          Start {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </Button>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const totalQuestions = state.questions.length;

  const handleNext = () => {
    if (state.currentQuestionIndex < totalQuestions - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
      // Last question, potentially auto-submit or show finish button
      if (mode === 'exam') {
        dispatch({ type: 'SUBMIT_ALL_ANSWERS' });
      }
      dispatch({ type: 'COMPLETE_QUIZ' });
      router.push('/summary');
    }
  };

  const handlePrev = () => {
    if (mode === 'practice') {
      dispatch({ type: 'PREV_QUESTION' });
    }
  };

  const handleFinishQuiz = () => {
    if (mode === 'exam') {
      dispatch({ type: 'SUBMIT_ALL_ANSWERS' });
    }
    dispatch({ type: 'COMPLETE_QUIZ' });
    router.push('/summary');
  };

  const toggleFullScreen = async () => {
    const elem = document.documentElement;
    try {
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          elem.classList.add('fullscreen-quiz'); 
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          elem.classList.remove('fullscreen-quiz');
        }
      }
    } catch (err) {
      console.error("Fullscreen API error:", err);
      // Fallback or error message if needed
    }
  };


  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-3xl flex flex-col sm:flex-row justify-between items-center p-4 bg-card rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-primary mb-2 sm:mb-0">
          {mode === 'practice' ? 'Practice Mode' : 'Exam Mode'}
        </h2>
        {mode === 'exam' && (
          <>
            <TimerDisplay />
            <Button onClick={toggleFullScreen} variant="outline" size="sm">
              {isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </Button>
          </>
        )}
      </div>

      {mode === 'exam' && <ProgressTracker current={state.currentQuestionIndex + 1} total={totalQuestions} />}
      
      <QuestionCard
        key={currentQuestion.id} // Ensure re-render on question change
        question={currentQuestion}
        questionNumber={state.currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onAnswerSubmit={submitAndShowAnswer}
      />

      <div className="flex flex-wrap justify-center gap-4 mt-6 w-full max-w-2xl">
        {mode === 'practice' && (
          <Button onClick={handlePrev} disabled={state.currentQuestionIndex === 0} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
        )}
        <Button onClick={handleNext} variant="default" className="flex-grow sm:flex-grow-0">
          {state.currentQuestionIndex === totalQuestions - 1 ? 'Finish & View Summary' : 'Next Question'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>

        {/* Only show separate Finish Quiz button if not on the last question or in practice mode */}
        { (mode === 'practice' || (mode === 'exam' && state.currentQuestionIndex < totalQuestions - 1)) && (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-grow sm:flex-grow-0">
                        <LogOut className="mr-2 h-4 w-4" /> Finish Quiz
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to finish the quiz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your progress will be saved, and you'll be taken to the summary page.
                        {mode === 'exam' && ' Any unanswered questions will be marked as incorrect.'}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinishQuiz}>Finish Quiz</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>
    </div>
  );
}
