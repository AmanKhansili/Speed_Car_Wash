import { useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function OAuthNativeCallback() {
  const router = useRouter();

  useEffect(() => {
    // Clerk session ko automatically handle kar leta hai, 
    // yeh page bas ek temporary landing zone hai jo redirect karega.
    const timer = setTimeout(() => {
      router.replace('/(tabs)'); // Apne home/dashboard route ka path yahan dein
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#ffffff" />
      <Text style={{ color: '#ffffff', marginTop: 12, fontSize: 16 }}>Completing login...</Text>
    </View>
  );
}