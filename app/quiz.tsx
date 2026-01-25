import { router } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { questions } from "../questions";

export default function QuizScreen() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const question = questions[index];

  const selectAnswer = (choice: string) => {
    setAnswers({ ...answers, [question.id]: choice });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) score++;
    });
    return score;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question.question}</Text>

      {Object.entries(question.choices).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.choice,
            answers[question.id] === key && styles.selected,
          ]}
          onPress={() => selectAnswer(key)}
        >
          <Text>
            {key}. {value}
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
  question: {
    fontSize: 18,
    marginBottom: 15,
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
});
