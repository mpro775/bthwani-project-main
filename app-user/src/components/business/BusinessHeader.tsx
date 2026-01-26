import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  image: ImageSourcePropType | { uri?: string | null }; // صورة الغلاف
  onBackPress?: () => void;
  onSharePress?: () => void | Promise<void>;
  onFavoritePress?: () => void | Promise<void>;
  /** ↓ جديدان */
  isFavorite?: boolean; // حالة المفضلة للمتجر
  favoriteDisabled?: boolean; // تعطيل زر القلب أثناء المعالجة
}

const BusinessHeader: React.FC<Props> = ({
  image,
  onBackPress,
  onSharePress,
  onFavoritePress,
  isFavorite = false,
  favoriteDisabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* صورة الغلاف + طبقة تعتيم خفيفة */}
      <Image
        testID="cover-image"
        source={image as ImageSourcePropType}
        style={styles.coverImage}
      />
      <View style={styles.gradientOverlay} />

      {/* شريط التحكم */}
      <View style={styles.controlBar}>
        {/* رجوع */}
        <TouchableOpacity
          testID="back-button"
          onPress={onBackPress}
          style={styles.controlButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.background}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* يمين: مفضلة + مشاركة */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            testID="favorite-button"
            onPress={onFavoritePress}
            style={[
              styles.controlButton,
              styles.actionButton,
              isFavorite && styles.favOn,
              favoriteDisabled && styles.disabledBtn,
            ]}
            activeOpacity={0.7}
            disabled={favoriteDisabled}
          >
            {favoriteDisabled ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={COLORS.background}
                style={styles.buttonIcon}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="share-button"
            onPress={onSharePress}
            style={[styles.controlButton, styles.actionButton]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-social"
              size={22}
              color={COLORS.background}
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const R = 32;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  coverImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderBottomLeftRadius: R,
    borderBottomRightRadius: R,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderBottomLeftRadius: R,
    borderBottomRightRadius: R,
  },
  controlBar: {
    position: "absolute",
    top: 48,
    left: 24,
    right: 24,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rightActions: {
    flexDirection: "row-reverse",
    gap: 16,
  },
  actionButton: { backgroundColor: "rgba(0,0,0,0.25)" },
  favOn: { backgroundColor: "rgba(216,67,21,0.9)" }, // إبراز عند كونه مفضلة
  disabledBtn: { opacity: 0.6 },
  buttonIcon: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default BusinessHeader;
