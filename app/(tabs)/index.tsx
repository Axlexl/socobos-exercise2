import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz App</Text>
      <Button title="Start Quiz" onPress={() => router.push("/quiz")} />
      <View style={styles.spacer} />
      <Button
        title="Quiz Manager"
        onPress={() => router.push("/(tabs)/settings" as any)}
        color="#FF9500"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  spacer: {
    height: 20,
  },
});
