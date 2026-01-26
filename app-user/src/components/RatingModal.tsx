import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("خطأ", "الرجاء اختيار عدد النجوم");
      return;
    }
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={["#FFFFFF", "#FFF5F2"]}
          style={styles.modalContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.modalTitle}>قيم تجربتك</Text>

          {/* النجوم التفاعلية */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                onPressIn={() => setHoverRating(star)}
                onPressOut={() => setHoverRating(0)}
              >
                <Ionicons
                  name={
                    star <= (hoverRating || rating) ? "star" : "star-outline"
                  }
                  size={40}
                  color={star <= (hoverRating || rating) ? "#FFD700" : "#DDD"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* حقل التعليق */}
          <TextInput
            style={styles.commentInput}
            placeholder="أضف تعليقك هنا (اختياري)..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          {/* أزرار الإجراءات */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>إرسال التقييم</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#D84315",
    textAlign: "center",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
    fontFamily: "Cairo-Regular",
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#D84315",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: "#FFF",
  },
});

export default RatingModal;
