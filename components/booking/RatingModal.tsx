import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface RatingModalProps {
  visible: boolean;
  serviceTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function RatingModal({
  visible,
  serviceTitle,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      setComment("");
      setRating(5);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Rate Your Service</Text>
              <Text style={styles.subTitle}>{serviceTitle}</Text>

              {/* Star Rating Row */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} activeOpacity={0.7} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={36}
                      color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Share your experience (Optional)..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  subTitle: { fontSize: 13, color: "#64748B", marginTop: 4, textAlign: "center" },
  starRow: { flexDirection: "row", gap: 10, marginVertical: 18 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 18,
    height: 80,
  },
  actions: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: { color: "#64748B", fontWeight: "600", fontSize: 14 },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary || "#2563EB",
    alignItems: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
