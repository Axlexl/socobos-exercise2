export interface Question {
  id: number;
  type: "multiple" | "truefalse" | "checkbox";
  question: string;
  choices: { [key: string]: string };
  answer: string | string[];
}

export const questions: Question[];
