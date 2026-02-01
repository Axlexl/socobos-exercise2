import React, { createContext, ReactNode, useContext, useState } from "react";
import { questions as defaultQuestions } from "../questions";

export interface Question {
  id: number;
  type: "multiple" | "truefalse";
  question: string;
  choices: { [key: string]: string };
  answer: string;
}

interface QuizContextType {
  questions: Question[];
  timer: number;
  setTimer: (timer: number) => void;
  addQuestion: (question: Question) => void;
  deleteQuestion: (id: number) => void;
  updateQuestion: (id: number, question: Question) => void;
  resetQuestions: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>(
    (defaultQuestions as any[]).map((q: any) => ({
      ...q,
      type: q.type as "multiple" | "truefalse",
    })),
  );
  const [timer, setTimer] = useState(300); // 5 minutes default

  const addQuestion = (question: Question) => {
    const maxId = Math.max(...questions.map((q) => q.id), 0);
    setQuestions([...questions, { ...question, id: maxId + 1 }]);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: number, updatedQuestion: Question) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...updatedQuestion, id } : q)),
    );
  };

  const resetQuestions = () => {
    setQuestions(
      (defaultQuestions as any[]).map((q: any) => ({
        ...q,
        type: q.type as "multiple" | "truefalse",
      })),
    );
  };

  return (
    <QuizContext.Provider
      value={{
        questions,
        timer,
        setTimer,
        addQuestion,
        deleteQuestion,
        updateQuestion,
        resetQuestions,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }
  return context;
};
