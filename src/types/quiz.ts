export type QuestionType = "MCQ" | "TRUE_FALSE" | "INPUT";

export interface Question {
    id: string;
    question: string;
    type: QuestionType;
    options?: string[]; // For MCQ
    answer: string | string[] | boolean; // boolean for TF, string[] for with multiple blanks
    description: string;
    hints: string[];
    tags?: string[]; // Optional: for stretch goal
}

export interface UserAnswer {
    questionId: string;
    answer: string | string[] | boolean;
    isCorrect?: boolean; // Will be set after submission/checking
}

export interface QuizState {
    questions: Question[];
    currentQuestionIndex: number;
    userAnswers: Map<string, UserAnswer>; // question.id -> UserAnswer
    score: number;
    quizMode: "practice" | "exam" | "summary" | null;
    timeLeft: number; // in seconds
    isQuizActive: boolean;
    isQuizCompleted: boolean;
    examConfig: {
        totalQuestions: number;
        durationMinutes: number;
    };
}

export type QuizAction =
    | { type: "START_QUIZ"; payload: { questions: Question[]; mode: "practice" | "exam"; config?: Partial<QuizState['examConfig']> } }
    | { type: "SELECT_ANSWER"; payload: { questionId: string; answer: string | string[] | boolean } }
    | { type: "SUBMIT_ANSWER"; payload: { questionId: string } } // For immediate feedback modes
    | { type: "SUBMIT_ALL_ANSWERS" } // For exam mode end or manual submission
    | { type: "NEXT_QUESTION" }
    | { type: "PREV_QUESTION" }
    | { type: "SET_TIME_LEFT"; payload: number }
    | { type: "COMPLETE_QUIZ" }
    | { type: "RESET_QUIZ" };
