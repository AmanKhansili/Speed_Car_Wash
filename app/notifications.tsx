import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors"; 

type NotificationType = "booking" | "offer" | "reminder" | "system";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
//   {
//     id: "1",
//     type: "booking",
//     title: "Booking Confirmed",
//     message: "Your car wash is scheduled for tomorrow at 10:00 AM.",
//     time: "2h ago",
//     read: false,
//   },
//   {
//     id: "2",
//     type: "offer",
//     title: "20% OFF This Weekend",
//     message: "Book any premium wash and save 20% — valid till Sunday.",
//     time: "5h ago",
//     read: false,
//   },
//   {
//     id: "3",
//     type: "reminder",
//     title: "Upcoming Wash Reminder",
//     message: "Don't forget, your pickup is in 1 hour.",
//     time: "1d ago",
//     read: true,
//   },
//   {
//     id: "4",
//     type: "system",
//     title: "Referral Reward Unlocked",
//     message: "You just unlocked 30% OFF from your 3rd referral!",
//     time: "2d ago",
//     read: true,
//   },
];

const TYPE_META: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  booking: { icon: "car-outline", bg: Colors.primaryLight, color: Colors.primary },
  offer: { icon: "pricetag-outline", bg: "#FEF3C7", color: Colors.warning },
  reminder: { icon: "time-outline", bg: Colors.secondaryLight, color: Colors.secondary },
  system: { icon: "checkmark-circle-outline", bg: "#D1FAE5", color: Colors.success },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const meta = TYPE_META[item.type];
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => markOneRead(item.id)}
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
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={40} color={Colors.textLight} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 10 }}
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