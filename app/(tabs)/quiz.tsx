import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Question, useQuiz } from "../QuizContext";

export default function QuizScreen() {
  const { questions, timer } = useQuiz();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(timer);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    setTimeLeft(timer);
  }, [timer]);

  useEffect(() => {
    if (quizFinished || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizFinished, questions.length]);

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noQuestions}>
          No questions available. Please add questions in Quiz Manager.
        </Text>
        <Button
          title="Go to Quiz Manager"
          onPress={() => router.push("/(tabs)/settings" as any)}
        />
      </View>
    );
  }

  const question = questions[index];

  const selectAnswer = (choice: string) => {
    setAnswers({ ...answers, [question.id]: choice });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q: Question) => {
      if (answers[q.id] === q.answer) score++;
    });
    return score;
  };

  const handleFinish = () => {
    setQuizFinished(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (quizFinished) {
    const score = calculateScore();
    return (
      <View style={styles.container}>
        <Text style={styles.resultText}>
          Your Score: {score} / {questions.length}
        </Text>
        <Button
          title="Back to Home"
          onPress={() => router.replace("/(tabs)" as any)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
          Time Left: {formatTime(timeLeft)}
        </Text>
      </View>

      <Text style={styles.question}>{question.question}</Text>

      {Object.entries(question.choices).map(([key, value]: [string, any]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.choice,
            answers[question.id] === key && styles.selected,
          ]}
          onPress={() => selectAnswer(key)}
        >
          <Text>
            {key}. {String(value)}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.buttons}>
        <Button
          title="Previous"
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
        />

        {index === questions.length - 1 ? (
          <Button
            title="Finish"
            onPress={() =>
              router.push({
                pathname: "/result",
                params: {
                  score: calculateScore(),
                  total: questions.length,
                },
              })
            }
          />
        ) : (
          <Button title="Next" onPress={() => setIndex(index + 1)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  timerContainer: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  timerWarning: {
    color: "#FF3B30",
  },
  noQuestions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  question: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
  },
  choice: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#cce5ff",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});
