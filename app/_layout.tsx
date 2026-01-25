import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="quiz" options={{ title: "Quiz" }} />
      <Stack.Screen name="result" options={{ title: "Result" }} />
    </Stack>
  );
}
