import Colors from "@/constants/colors";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from "react-native";

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function RefreshableScrollView({
  onRefresh,
  isLoading = false,
  children,
  contentContainerStyle,
  ...props
}: RefreshableScrollViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Fix yahan hai:
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setRefreshing(false);
    }, 3500);

    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setRefreshing(false);
    }
  }, [onRefresh]);

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[Colors.primary || "#2563EB"]}
      tintColor={Colors.primary || "#2563EB"}
    />
  ) : undefined;

  // Agar page load ho raha ho tab bhi user pull-to-refresh kar payega
  if (isLoading && !refreshing) {
    return (
      <ScrollView
        contentContainerStyle={[styles.centerContainer, contentContainerStyle]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      refreshControl={refreshControl}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
});
