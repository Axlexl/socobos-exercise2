declare module "../questions" {
  interface Question {
    id: number;
    type: "multiple" | "truefalse";
    question: string;
    choices: { [key: string]: string };
    answer: string;
  }

  export const questions: Question[];
}
