// src/screens/ErrorScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type ErrorType = '401' | '403' | '404' | '500' | 'network' | 'unknown';

interface ErrorScreenParams {
  type: ErrorType;
  title?: string;
  message?: string;
  code?: string;
}

type RootStackParamList = {
  ErrorScreen: ErrorScreenParams;
};

type ErrorScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ErrorScreenRouteProp = RouteProp<RootStackParamList, 'ErrorScreen'>;

interface ErrorScreenProps {
  navigation: ErrorScreenNavigationProp;
  route: ErrorScreenRouteProp;
}

const ERROR_CONFIG = {
  '401': {
    title: 'تسجيل الدخول مطلوب',
    message: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة',
    icon: '🔒',
    primaryAction: 'تسجيل الدخول',
    secondaryAction: 'العودة',
  },
  '403': {
    title: 'غير مسموح بالوصول',
    message: 'ليس لديك صلاحية كافية للوصول إلى هذا المحتوى',
    icon: '🚫',
    primaryAction: 'الرجوع',
    secondaryAction: 'الرئيسية',
  },
  '404': {
    title: 'الصفحة غير موجودة',
    message: 'عذراً، الصفحة التي تبحث عنها غير متوفرة',
    icon: '🔍',
    primaryAction: 'العودة',
    secondaryAction: 'الرئيسية',
  },
  '500': {
    title: 'خطأ في الخادم',
    message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
    icon: '⚠️',
    primaryAction: 'إعادة المحاولة',
    secondaryAction: 'الرئيسية',
  },
  'network': {
    title: 'مشكلة في الاتصال',
    message: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
    icon: '📡',
    primaryAction: 'إعادة المحاولة',
    secondaryAction: 'الرئيسية',
  },
  'unknown': {
    title: 'خطأ غير معروف',
    message: 'حدث خطأ غير متوقع',
    icon: '❓',
    primaryAction: 'العودة',
    secondaryAction: 'الرئيسية',
  },
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({ navigation, route }) => {
  const { type, title, message, code } = route.params || {};

  const errorConfig = ERROR_CONFIG[type || 'unknown'];

  const handlePrimaryAction = () => {
    switch (type) {
      case '401':
        navigation.navigate('Login' as any);
        break;
      case '403':
        navigation.goBack();
        break;
      case '404':
        navigation.goBack();
        break;
      case '500':
      case 'network':
        navigation.goBack();
        break;
      default:
        navigation.goBack();
    }
  };

  const handleSecondaryAction = () => {
    navigation.navigate('Home' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc3545" />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{errorConfig.icon}</Text>
        </View>

        <Text style={styles.title}>
          {title || errorConfig.title}
        </Text>

        <Text style={styles.message}>
          {message || errorConfig.message}
        </Text>

        {code && (
          <Text style={styles.code}>
            رمز الخطأ: {code}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handlePrimaryAction}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {errorConfig.primaryAction}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSecondaryAction}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              {errorConfig.secondaryAction}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  code: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#6c757d',
  },
});

export default ErrorScreen;

// Helper function to navigate to error screen
export const navigateToErrorScreen = (
  navigation: any,
  type: ErrorType,
  customTitle?: string,
  customMessage?: string,
  code?: string
) => {
  navigation.navigate('ErrorScreen', {
    type,
    title: customTitle,
    message: customMessage,
    code,
  });
};
