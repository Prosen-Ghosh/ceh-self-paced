"use client";

import { useQuiz } from '@/hooks/useQuiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle2, XCircle, BarChart3, AlertTriangle, Brain } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Question } from '@/types/quiz';

export default function SummaryPage() {
  const { state, dispatch } = useQuiz();
  const router = useRouter();

  useEffect(() => {
    if (!state.isQuizCompleted && !state.isQuizActive) {
      // If quiz wasn't completed (e.g. direct navigation), redirect to home
      // Allow access if quiz is active but user somehow navigated here (though QuizDisplay should prevent this)
      // Or if quiz is truly completed.
      // A better check might be if there are questions and answers.
      if (state.questions.length === 0 || state.userAnswers.size === 0 && !state.isQuizCompleted) {
         router.push('/');
      }
    }
  }, [state.isQuizCompleted, state.isQuizActive, state.questions, state.userAnswers, router]);
  
  if (state.questions.length === 0) {
     return (
        <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No quiz data found. Please complete a quiz first.</p>
            <Button asChild className="mt-4">
                <Link href="/">Go to Home</Link>
            </Button>
        </div>
     )
  }


  const totalQuestions = state.questions.length;
  const correctAnswers = state.score;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const percentageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const getWeakAreas = () => {
    // This is a placeholder. True weak area analysis would require question tagging and more complex logic.
    // For now, just list a few incorrect questions as examples.
    const incorrect: Question[] = [];
    state.questions.forEach(q => {
      const userAnswer = state.userAnswers.get(q.id);
      if (userAnswer && !userAnswer.isCorrect) {
        incorrect.push(q);
      }
    });
    return incorrect.slice(0, 3).map(q => q.question.substring(0, 50) + "..."); // Show snippets
  };

  const weakAreas = getWeakAreas();

  const handleRetake = () => {
    const mode = state.quizMode === 'summary' ? (state.questions.length === state.examConfig.totalQuestions ? 'exam' : 'practice') : (state.quizMode || 'practice');
    dispatch({ type: 'RESET_QUIZ' }); // Resets quiz state but keeps config
    router.push(mode === 'exam' ? '/exam' : '/practice');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-muted/30">
          <BarChart3 className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-4xl font-bold">Quiz Summary</CardTitle>
          <CardDescription className="text-lg">
            Here's how you performed in the {state.quizMode === 'summary' ? (state.questions.length === state.examConfig.totalQuestions ? 'exam' : 'practice') : state.quizMode} session.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{percentageScore.toFixed(1)}%</p>
                <p className="text-muted-foreground">({correctAnswers} / {totalQuestions})</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-xl">Correct Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{correctAnswers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <XCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="text-xl">Incorrect Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{incorrectAnswers}</p>
              </CardContent>
            </Card>
          </div>

          {weakAreas.length > 0 && (
            <Card>
              <CardHeader>
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-2 inline-block" />
                <CardTitle className="text-xl inline-block align-middle">Areas for Improvement</CardTitle>
                <CardDescription>Focus on these topics based on your incorrect answers.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {weakAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-blue-50 border-blue-200">
             <CardHeader>
                <Brain className="h-6 w-6 text-primary mr-2 inline-block" />
                <CardTitle className="text-xl inline-block align-middle">AI Insights (Mock)</CardTitle>
                 <CardDescription>Our AI has analyzed your performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Based on your responses, it seems you consistently struggled with questions related to 'Network Protocols'. Consider reviewing this topic. 
                    (This is a mock AI insight. Actual AI integration would provide specific feedback).
                </p>
            </CardContent>
          </Card>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6 border-t">
          <Button onClick={handleRetake} size="lg">
            Retake {state.quizMode === 'summary' ? (state.questions.length === state.examConfig.totalQuestions ? 'Exam' : 'Practice') : state.quizMode}
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
