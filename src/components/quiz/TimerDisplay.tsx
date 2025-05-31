"use client";

import { useQuiz } from '@/hooks/useQuiz';
import { formatTime } from '@/lib/quizUtils';
import { Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TimerDisplay() {
  const { state } = useQuiz();

  if (state.quizMode !== 'exam' || !state.isQuizActive) {
    return null;
  }

  const timeFormatted = formatTime(state.timeLeft);
  const isLowTime = state.timeLeft <= 300; // 5 minutes

  return (
    <Card className={`p-2 shadow-none border-0 ${isLowTime && state.timeLeft > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-transparent'}`}>
      <CardContent className="p-0 flex items-center space-x-2">
        <Timer className={`h-6 w-6 ${isLowTime && state.timeLeft > 0 ? 'text-white' : 'text-primary'}`} />
        <span className={`text-lg font-semibold tabular-nums ${isLowTime && state.timeLeft > 0 ? 'text-white' : 'text-foreground'}`}>
          {timeFormatted}
        </span>
      </CardContent>
    </Card>
  );
}
