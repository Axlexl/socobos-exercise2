import { Stack } from "expo-router";
import { QuizProvider } from "./QuizContext";

export default function Layout() {
  return (
    <QuizProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QuizProvider>
  );
}
