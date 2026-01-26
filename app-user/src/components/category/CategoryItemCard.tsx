import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../../constants/colors";

// تعريف نوع العنصر
interface Item {
  id: string;
  title: string;
  subtitle: string;
  distance: string;
  time: string;
  rating: number;
  isOpen: boolean;
  isFavorite: boolean;
  tags: string[];
  image: any;
  logo: any;
  discountLabel?: string;
}

// تعريف Props للكومبوننت
interface Props {
  item: Item;
  onPress?: (id: string) => void;
  showStatus?: boolean;
  onToggleFavorite?: () => void;
}

const CategoryItemCardSimple: React.FC<Props> = ({
  item,
  onPress,
  showStatus = true,
  onToggleFavorite,
}) => {
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  const [badgeScale] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (item.discountLabel) {
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // إضافة تأثير نبض خفيف لجذب الانتباه
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [item.discountLabel]);

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  return (
    <TouchableOpacity
      testID="category-card"
      style={styles.card}
      onPress={() => onPress?.(item.id)}
      activeOpacity={0.9}
    >
      {/* 👈 انقل البادج هنا بدل داخل logoContainer */}
      {item.discountLabel ? (
        <Animated.View
          style={[
            styles.discountBadge, // يتموضع يمين أعلى الكارد
            {
              transform: [
                { scale: Animated.multiply(badgeScale, pulseAnim) },
                {
                  rotate: badgeScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-15deg", "0deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#FF6B35", "#D84315", "#B22222"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.discountBadgeGradient}
          >
            <Ionicons
              name="pricetag"
              size={10}
              color="#fff"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.discountBadgeText}>{item.discountLabel}</Text>
          </LinearGradient>
        </Animated.View>
      ) : null}
      {/* شعار المتجر */}
      <View style={styles.logoContainer}>
        <Image
          source={item.logo}
          style={styles.logo}
          accessibilityLabel={`شعار ${item.title}`}
          accessible={false}
          importantForAccessibility="no"
        />
        <View style={styles.rating}>
          <Ionicons
            name="star"
            size={12}
            color="#FFD700"
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      {/* تفاصيل المتجر */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <TouchableOpacity
            onPress={handleFavoritePress}
            testID="heart-button"
            style={styles.heartButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            accessibilityHint="يضيف أو يزيل المتجر من قائمة المفضلة"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? COLORS.danger : COLORS.gray}
              accessible={false}
              importantForAccessibility="no"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.blue}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={styles.infoText}>{item.distance}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={COLORS.blue}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
        </View>

        {/* العلامات */}
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* حالة المتجر */}
      {showStatus && (
        <View
          style={[
            styles.statusBadge,
            item.isOpen ? styles.openBadge : styles.closedBadge,
          ]}
        >
          <View
            style={styles.statusIndicator}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={styles.statusText}>
            {item.isOpen ? "مفتوح" : "مغلق"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CategoryItemCardSimple;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    position: "relative",
    overflow: "hidden",
  },
  logoContainer: {
    position: "relative",
    marginRight: 16,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8, // ✅ كان left: 5 —> خليه يمين أعلى الكارد (بعكس اللوجو)
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  discountBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    minWidth: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  discountBadgeText: {
    fontSize: 11,
    fontFamily: "Cairo-Bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  rating: {
    position: "absolute",
    bottom: -6,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    color: COLORS.background,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.background,
  },
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.blue,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#00000",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  openBadge: {
    backgroundColor: COLORS.success,
    color: COLORS.background,
  },
  closedBadge: {
    backgroundColor: COLORS.danger,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.background,
    fontFamily: "Cairo-SemiBold",
  },
});
