import type { Question, UserAnswer } from '@/types/quiz';

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function calculateScore(questions: Question[], userAnswers: Map<string, UserAnswer>): number {
  let score = 0;
  questions.forEach(question => {
    const userAnswer = userAnswers.get(question.id);
    if (userAnswer && checkAnswerCorrectness(question, userAnswer.answer)) {
      score++;
    }
  });
  return score;
}

export function checkAnswerCorrectness(question: Question, userAnswer: string | string[] | boolean): boolean {
  if (typeof question.answer === 'string' && typeof userAnswer === 'string') {
    return question.answer.toLowerCase() === userAnswer.toLowerCase();
  }
  if (typeof question.answer === 'boolean' && typeof userAnswer === 'boolean') {
    return question.answer === userAnswer;
  }
  if (typeof question.answer === 'string' && typeof userAnswer === 'boolean') {
    return Boolean(question.answer.toLowerCase()) === userAnswer;
  }
  // For MCQ, TF (if answer stored as string "true"/"false")
  if (typeof question.answer === 'string' && typeof userAnswer === 'string') {
     return question.answer.toLowerCase() === userAnswer.toLowerCase();
  }
   if (typeof question.answer === 'boolean' && typeof userAnswer === 'string') { // TF answer is boolean, user answer is string "true" or "false"
    return String(question.answer).toLowerCase() === userAnswer.toLowerCase();
  }
  return false;
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  
  if (hours > 0) {
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
}
