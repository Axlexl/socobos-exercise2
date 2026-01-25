import { router, useLocalSearchParams } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

let highestScore = 0;

export default function ResultScreen() {
  const { score, total } = useLocalSearchParams();

  const currentScore = Number(score);

  if (currentScore > highestScore) {
    highestScore = currentScore;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Your Score: {currentScore} / {total}
      </Text>
      <Text style={styles.text}>Highest Score: {highestScore}</Text>

      <Button title="Back to Home" onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
