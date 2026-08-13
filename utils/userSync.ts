import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { syncUserToSupabase } from "@/utils/saveUser";

export function useSyncClerkUser() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded && isSignedIn && user) {
      syncUserToSupabase(user);
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user]);
}