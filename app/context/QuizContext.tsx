import React, { createContext, ReactNode, useContext, useState } from "react";
import { questions as defaultQuestions } from "../../questions.js";

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
    setQuestions((prevQuestions) => {
      const maxId = Math.max(...prevQuestions.map((q) => q.id), 0);
      return [...prevQuestions, { ...question, id: maxId + 1 }];
    });
  };

  const deleteQuestion = (id: number) => {
    console.log("deleteQuestion called with id:", id);
    console.log("Current questions before delete:", questions);
    setQuestions((prevQuestions) => {
      const filtered = prevQuestions.filter((q) => q.id !== id);
      console.log("Questions after delete:", filtered);
      return filtered;
    });
  };

  const updateQuestion = (id: number, updatedQuestion: Question) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...updatedQuestion, id } : q)),
    );
  };

  const resetQuestions = () => {
    console.log("resetQuestions called");
    const resetQs = (defaultQuestions as any[]).map((q: any) => ({
      ...q,
      type: q.type as "multiple" | "truefalse",
    }));
    console.log("Resetting to:", resetQs);
    setQuestions(resetQs);
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
