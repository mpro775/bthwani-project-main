import {
  fetchUserProfile,
  updateUserAvatar,
  updateUserProfileAPI,
} from "@/api/userApi";
import COLORS from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EditProfileScreen = () => {
  const [username, setUsername] = useState("");
  const [displayFullName, setDisplayFullName] = useState(true); // true: اسم كامل - false: مستعار

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchUserProfile();
        setName(user.fullName || "");
        setPhone(user.phone || user.phoneNumber || "");
        setAvatar(user.profileImage || user.avatar || undefined);
        setUsername(user.aliasName || "");
        setDisplayFullName(!user.aliasName);
      } catch (err) {
        Alert.alert("خطأ", "فشل تحميل البيانات من السيرفر");
      }
    };

    loadData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("تنبيه", "يجب منح صلاحية الوصول إلى الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = async () => {
    animatePress();

    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال الاسم الكامل");
      return;
    }

    if (!phone.trim() || phone.length < 8) {
      Alert.alert("تنبيه", "الرجاء إدخال رقم هاتف صحيح");
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = avatar;

      if (avatar && avatar.startsWith("file://")) {
        const uploaded = await updateUserAvatar(avatar);
        avatarUrl = uploaded.url;
      }

      const updatedData = {
        fullName: name,
        phone,
        aliasName: username,
        profileImage: avatarUrl,
      };

      const response = await updateUserProfileAPI(updatedData);

      Alert.alert("تم", "تم حفظ التعديلات", [
        { text: "حسناً", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "فشل حفظ التعديلات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
      </LinearGradient>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <Image
            source={
              avatar ? { uri: avatar } : require("../../../assets/avatar.png")
            }
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <MaterialIcons name="photo-camera" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>تغيير الصورة الشخصية</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="person"
            size={20}
            color={COLORS.blue}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="الاسم الكامل"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="phone"
            size={20}
            color={COLORS.blue}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="رقم الهاتف"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Save Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>حفظ التعديلات</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
  },
  headerTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    color: "#FFF",
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "#EEE",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#D84315",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  changePhotoText: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.blue,
    marginTop: 10,
    fontSize: 16,
  },
  formContainer: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    height: 55,
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    textAlign: "right",
    fontSize: 16,
    height: "100%",
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 25,
    marginTop: 10,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    fontFamily: "Cairo-Bold",
    color: "#FFF",
    fontSize: 18,
    marginRight: 10,
  },
});

export default EditProfileScreen;
