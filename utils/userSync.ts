import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { syncUserToSupabase } from "@/utils/saveUser";
import { registerForPushTokenAsync } from "@/utils/registerPushToken";

export function useSyncClerkUser() {
  const { isLoaded: isAuthLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded && isSignedIn && user) {
      syncUserToSupabase(user, getToken).then(() => {
        registerForPushTokenAsync(user.id, getToken);
      });
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user]);
}