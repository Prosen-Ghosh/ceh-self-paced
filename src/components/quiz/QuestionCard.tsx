"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Question, UserAnswer } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, HelpCircle, Lightbulb, RotateCcw, XCircle } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { Badge } from '@/components/ui/badge';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (questionId: string, answer: string | string[] | boolean) => void;
  isSubmitted?: boolean; // Optional: if the specific answer for this card is submitted
  userAnswer?: UserAnswer; // Optional: The user's current answer for this question
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const { state, submitAndShowAnswer } = useQuiz();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | boolean>('');
  const [fillInAnswers, setFillInAnswers] = useState<string[]>(
    Array.isArray(question.answer) ? Array(question.answer.length).fill('') : ['']
  );

  const userAnswerEntry = state.userAnswers.get(question.id);
  const isAnswerSubmitted = userAnswerEntry?.isCorrect !== undefined;
  const isCorrect = userAnswerEntry?.isCorrect;


  useEffect(() => {
    // Reset local state when question changes
    setIsFlipped(false);
    const currentAnswer = state.userAnswers.get(question.id)?.answer;
    if (currentAnswer !== undefined) {
      setSelectedAnswer(currentAnswer);
    } else {
      setSelectedAnswer('');
      setFillInAnswers(Array.isArray(question.answer) ? Array(question.answer.length).fill('') : ['']);
    }
  }, [question, state.userAnswers]);

  const handleInputChange = (value: string | string[] | boolean) => {
    setSelectedAnswer(value);
  };

  const handleSubmit = () => {
    submitAndShowAnswer(question.id, selectedAnswer);
  };

  const renderInputType = () => {
    switch (question.type) {
      case 'MCQ':
        return (
          <RadioGroup
            value={selectedAnswer as string}
            onValueChange={(value) => handleInputChange(value)}
            className="space-y-2"
            disabled={isAnswerSubmitted}
          >
            {question.options?.map((option, index) => (
              <div key={index} className={`flex items-center space-x-2 p-3 rounded-md border 
                ${isAnswerSubmitted && option === question.answer ? 'bg-green-100 border-green-400' : ''} 
                ${isAnswerSubmitted && option === selectedAnswer && option !== question.answer ? 'bg-red-100 border-red-400' : ''}
                ${!isAnswerSubmitted ? 'hover:bg-muted/50' : ''} `}>
                <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
                <Label htmlFor={`${question.id}-option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'TRUE_FALSE':
        return (
          <RadioGroup
            value={String(selectedAnswer)}
            onValueChange={(value) => handleInputChange(value?.toLowerCase() === 'true')}
            className="space-y-2"
            disabled={isAnswerSubmitted}
          >
            {["True", "False"].map((option, index) => (
              <div key={index} className={`flex items-center space-x-2 p-3 rounded-md border 
                ${isAnswerSubmitted && String(question.answer).toLowerCase() === option.toLowerCase() ? 'bg-green-100 border-green-400' : ''} 
                ${isAnswerSubmitted && String(selectedAnswer).toLowerCase() === option.toLowerCase() && String(question.answer).toLowerCase() !== option.toLowerCase() ? 'bg-red-100 border-red-400' : ''}
                ${!isAnswerSubmitted ? 'hover:bg-muted/50' : ''} `}>
                <RadioGroupItem value={option.toLowerCase()} id={`${question.id}-option-${index}`} />
                <Label htmlFor={`${question.id}-option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'INPUT':
        return (
          <Input
            type="text"
            value={selectedAnswer as string}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your answer"
            className={`
              ${isAnswerSubmitted && typeof question.answer === 'string' && question.answer.toLowerCase() === (selectedAnswer as string).toLowerCase() ? 'border-green-500 ring-green-500' : ''}
              ${isAnswerSubmitted && typeof question.answer === 'string' && question.answer.toLowerCase() !== (selectedAnswer as string).toLowerCase() ? 'border-red-500 ring-red-500' : ''}
            `}
            disabled={isAnswerSubmitted}
          />
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-inner min-h-[700px]">
          {/* Card Front: Question */}
          <div className="card-front">
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-sm">Question {questionNumber}/{totalQuestions}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setIsFlipped(!isFlipped)} aria-label="Show hint">
                  <Lightbulb className="mr-2 h-4 w-4" /> Hint ({question.hints.length})
                </Button>
              </div>
              <CardTitle className="text-2xl mt-2 leading-relaxed">{question.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderInputType()}
              {isAnswerSubmitted && (
                <div className={`mt-4 p-3 rounded-md text-sm flex items-center ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isCorrect ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                  {isCorrect ? 'Correct!' : 'Incorrect.'}
                </div>
              )}

              {isAnswerSubmitted && (
                <Card className="bg-muted/30 p-4 mt-2">
                  <CardTitle className="text-lg mb-2 flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-primary" /> Explanation
                  </CardTitle>
                  <CardDescription className="text-foreground">
                    {question.description}
                  </CardDescription>
                </Card>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
              {!isAnswerSubmitted && (
                <Button onClick={handleSubmit} className="w-full" disabled={selectedAnswer === '' || (Array.isArray(selectedAnswer) && selectedAnswer.every(s => s === ''))}>
                  Submit Answer
                </Button>
              )}

            </CardFooter>
          </div>

          {/* Card Back: Hints */}
          <div className="card-back bg-accent/10 p-6 border border-accent rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-accent-foreground flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" /> Hints
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsFlipped(!isFlipped)} aria-label="Show question">
                  <RotateCcw className="mr-2 h-4 w-4" /> Back to Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-accent-foreground">
              {question.hints.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {question.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              ) : (
                <p>No hints available for this question.</p>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground italic">Click "Back to Question" or the icon to flip back.</p>
            </CardFooter>
          </div>
        </div>
      </div>
    </Card>
  );
}
