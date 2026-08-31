import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NotificationType =
  | "booking_reminder_evening"
  | "booking_reminder_morning"
  | "status_check"
  | "review_request"
  | string;

type NotificationItem = {
  id: string;
  booking_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

const TYPE_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  booking_reminder_evening: {
    icon: "car-outline",
    bg: Colors.primaryLight,
    color: Colors.primary,
  },
  booking_reminder_morning: {
    icon: "car-outline",
    bg: Colors.primaryLight,
    color: Colors.primary,
  },
  status_check: {
    icon: "time-outline",
    bg: Colors.secondaryLight,
    color: Colors.secondary,
  },
  review_request: {
    icon: "star-outline",
    bg: "#FEF3C7",
    color: Colors.warning,
  },
  default: {
    icon: "checkmark-circle-outline",
    bg: "#D1FAE5",
    color: Colors.success,
  },
};

function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Memoized Card Component with explicit displayName
const NotificationCard = React.memo(function NotificationCard({
  item,
  onPress,
  onDelete,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onDelete: (id: string) => void;
}) {
  const meta = TYPE_META[item.type] || TYPE_META.default;
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {!item.read && <View style={styles.dot} />}
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
        <Text style={styles.cardTime}>{formatTimeAgo(item.created_at)}</Text>
      </View>
      {item.read && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ paddingLeft: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

NotificationCard.displayName = "NotificationCard";

export default function NotificationsScreen() {
  const router = useRouter();
  const { userId, getToken } = useAuth();

  // 🚀 STABLE TOKEN REF: Unstable function ref se re-render loop ko prevent karega
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 STABLE FETCH FUNCTION: Strictly locked to userId only
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const db = createClerkSupabaseClient(() => getTokenRef.current());

      const { data, error } = await db
        .from("notifications")
        .select("id, booking_id, type, title, message, read, created_at")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // 🚀 NO MORE `db` DEPENDENCY TO TRIGGER LOOPS!

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!userId) return;

    const db = createClerkSupabaseClient(() => getTokenRef.current());
    await db
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("clerk_user_id", userId)
      .eq("read", false);
  }, [userId]);

  const markOneRead = useCallback(
    async (item: NotificationItem) => {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));

      const db = createClerkSupabaseClient(() => getTokenRef.current());
      await db
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", item.id);

      if (item.booking_id && (item.type === "status_check" || item.type === "review_request")) {
        router.push({
          pathname: "/booking/service-check",
          params: { bookingId: item.booking_id, type: item.type },
        });
      }
    },
    [router],
  );

  const handleDelete = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const db = createClerkSupabaseClient(() => getTokenRef.current());
    const { data, error } = await db.from("notifications").delete().eq("id", id).select();

    if (error) {
      console.error("Supabase Delete Error:", error);
    } else if (!data || data.length === 0) {
      console.warn("Delete call went through, but 0 rows deleted in DB. Check RLS policies.");
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationCard item={item} onPress={markOneRead} onDelete={handleDelete} />
    ),
    [markOneRead, handleDelete],
  );

  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={40} color={Colors.textLight} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUnread: {
    borderColor: Colors.secondaryLight,
    backgroundColor: Colors.primaryLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
