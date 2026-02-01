import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Question, useQuiz } from "../../context/QuizContext";

const Tab = createMaterialTopTabNavigator();

// Preview Quiz Component
const PreviewQuizComponent = ({
  questions,
  timer,
}: {
  questions: Question[];
  timer: number;
}) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(timer);
  const [quizFinished, setQuizFinished] = useState(false);

  const question = questions[index];

  useEffect(() => {
    setTimeLeft(timer);
  }, [timer]);

  useEffect(() => {
    if (quizFinished || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
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
          No questions available. Add questions in Quiz Settings.
        </Text>
      </View>
    );
  }

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
        <Text style={styles.resultTitle}>Quiz Completed!</Text>
        <Text style={styles.resultScore}>
          Your Score: {score} / {questions.length}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIndex(0);
            setAnswers({});
            setTimeLeft(timer);
            setQuizFinished(false);
          }}
        >
          <Text style={styles.buttonText}>Retake Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
          Time Left: {formatTime(timeLeft)}
        </Text>
      </View>

      <Text style={styles.questionNumber}>
        Question {index + 1} of {questions.length}
      </Text>
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
        <TouchableOpacity
          style={[styles.navButton, index === 0 && styles.disabledButton]}
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        {index === questions.length - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={handleFinish}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setIndex(index + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

// Quiz Settings Component
const QuizSettingsComponent = () => {
  const {
    questions,
    timer,
    setTimer,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    resetQuestions,
  } = useQuiz();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    choiceA: "",
    choiceB: "",
    choiceC: "",
    choiceD: "",
    answer: "A",
    type: "multiple",
  });

  const handleAddOrUpdate = () => {
    if (!formData.question || !formData.choiceA || !formData.choiceB) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const questionObj: Question = {
      id: editingId || Date.now(),
      type: formData.type as "multiple" | "truefalse",
      question: formData.question,
      choices: {
        A: formData.choiceA,
        B: formData.choiceB,
        C: formData.choiceC,
        D: formData.choiceD,
      },
      answer: formData.answer,
    };

    if (editingId) {
      updateQuestion(editingId, questionObj);
      Alert.alert("Success", "Question updated");
    } else {
      addQuestion(questionObj);
      Alert.alert("Success", "Question added");
    }

    resetForm();
    setModalVisible(false);
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      question: question.question,
      choiceA: question.choices.A,
      choiceB: question.choices.B,
      choiceC: question.choices.C || "",
      choiceD: question.choices.D || "",
      answer: question.answer,
      type: question.type,
    });
    setModalVisible(true);
  };

  const handleDelete = useCallback(
    (id: number) => {
      console.log("handleDelete called with id:", id);
      try {
        deleteQuestion(id);
        Alert.alert("Success", "Question deleted successfully");
      } catch (error) {
        console.error("Error deleting question:", error);
        Alert.alert("Error", "Failed to delete question");
      }
    },
    [deleteQuestion],
  );

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question: "",
      choiceA: "",
      choiceB: "",
      choiceC: "",
      choiceD: "",
      answer: "A",
      type: "multiple",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timerSection}>
        <Text style={styles.sectionTitle}>Quiz Timer (seconds)</Text>
        <TextInput
          style={styles.timerInput}
          keyboardType="numeric"
          value={timer.toString()}
          onChangeText={(text) => setTimer(parseInt(text) || 0)}
          placeholder="Enter timer in seconds"
        />
        <Text style={styles.timerDisplay}>
          Current: {Math.floor(timer / 60)}m {timer % 60}s
        </Text>
      </View>

      <View style={styles.questionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Quiz Questions ({questions.length})
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {questions.length === 0 ? (
          <Text style={styles.noQuestionsText}>No questions added yet</Text>
        ) : (
          questions.map((item) => (
            <View key={item.id.toString()} style={styles.questionItem}>
              <View style={styles.questionContent}>
                <Text style={styles.questionItemText}>{item.question}</Text>
                <Text style={styles.questionMeta}>Answer: {item.answer}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          console.log("Reset button pressed");
          try {
            resetQuestions();
            Alert.alert("Success", "Questions reset to default");
          } catch (error) {
            console.error("Error resetting questions:", error);
            Alert.alert("Error", "Failed to reset questions");
          }
        }}
      >
        <Text style={styles.buttonText}>Reset to Default</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Question" : "Add Question"}
            </Text>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Question *</Text>
              <TextInput
                style={styles.input}
                value={formData.question}
                onChangeText={(text) =>
                  setFormData({ ...formData, question: text })
                }
                placeholder="Enter question"
                multiline
              />

              <Text style={styles.label}>Choice A *</Text>
              <TextInput
                style={styles.input}
                value={formData.choiceA}
                onChangeText={(text) =>
                  setFormData({ ...formData, choiceA: text })
                }
                placeholder="Enter choice A"
              />

              <Text style={styles.label}>Choice B *</Text>
              <TextInput
                style={styles.input}
                value={formData.choiceB}
                onChangeText={(text) =>
                  setFormData({ ...formData, choiceB: text })
                }
                placeholder="Enter choice B"
              />

              <Text style={styles.label}>Choice C</Text>
              <TextInput
                style={styles.input}
                value={formData.choiceC}
                onChangeText={(text) =>
                  setFormData({ ...formData, choiceC: text })
                }
                placeholder="Enter choice C (optional)"
              />

              <Text style={styles.label}>Choice D</Text>
              <TextInput
                style={styles.input}
                value={formData.choiceD}
                onChangeText={(text) =>
                  setFormData({ ...formData, choiceD: text })
                }
                placeholder="Enter choice D (optional)"
              />

              <Text style={styles.label}>Correct Answer *</Text>
              <View style={styles.answerButtons}>
                {["A", "B", "C", "D"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.answerButton,
                      formData.answer === opt && styles.selectedAnswer,
                    ]}
                    onPress={() => setFormData({ ...formData, answer: opt })}
                  >
                    <Text
                      style={
                        formData.answer === opt
                          ? styles.selectedAnswerText
                          : styles.answerButtonText
                      }
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddOrUpdate}
              >
                <Text style={styles.buttonText}>
                  {editingId ? "Update" : "Add"} Question
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
};

// Settings Screen with Tabs
export default function SettingsScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#007AFF" },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="preview"
        options={{ title: "Preview Quiz" }}
        children={() => {
          const { questions, timer } = useQuiz();
          return <PreviewQuizComponent questions={questions} timer={timer} />;
        }}
      />
      <Tab.Screen
        name="settings"
        options={{ title: "Quiz Settings" }}
        children={() => <QuizSettingsComponent />}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  noQuestions: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  timerContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  timerWarning: {
    color: "#FF3B30",
  },
  questionNumber: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 10,
    marginTop: 10,
  },
  question: {
    fontSize: 18,
    marginBottom: 15,
    marginHorizontal: 10,
    marginTop: 10,
    fontWeight: "600",
  },
  choice: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: "#fff",
  },
  selected: {
    backgroundColor: "#cce5ff",
    borderColor: "#007AFF",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 10,
    marginBottom: 30,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
  },
  resultScore: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  timerSection: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 14,
  },
  timerDisplay: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  questionsSection: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noQuestionsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 14,
  },
  questionItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionContent: {
    flex: 1,
    marginRight: 10,
  },
  questionItemText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  questionMeta: {
    fontSize: 12,
    color: "#666",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#FF9500",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 20,
  },
  formScroll: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  answerButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  answerButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedAnswer: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  answerButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  selectedAnswerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#999",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});
