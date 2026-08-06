import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Main Tabs Group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Full Screen Page (Outside Tabs) */}
        <Stack.Screen 
          name="add-booking" 
          options={{ 
            headerShown: false,
            presentation: "card", // Ya "modal" sliding animation ke liye
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}