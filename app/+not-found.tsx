import { router, Stack } from "expo-router";
import { Compass } from "lucide-react-native";
import { Button, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <EmptyState icon={Compass} title="Page not found" text="The page you're looking for doesn't exist." action={<Button title="Go home" onPress={() => router.replace("/")} />} />
    </>
  );
}
