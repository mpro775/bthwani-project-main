export type RootStackParamList = {
  // الحساب والموقع
  UserProfile: undefined;
  MainApp: undefined;
  EditProfile: undefined;
  WalletStack: undefined;
  PaymentStack: undefined;
  AbsherForm: { category: string };
  AkhdimniScreen: undefined;
  AkhdimniOptionsScreen: undefined; // اخدمني: اختيار بين اخدمني / غاز / وايت ماء
  OrderDetails: { orderId: string };
  SheinScreen: undefined;
  Subscriptions: undefined;
  HowToUse: undefined;
  WebPage: { title: string; url: string };
  Support: undefined;
  WasliScreen: undefined;
  UtilityGasScreen: undefined; // واجهة الغاز
  UtilityWaterScreen: undefined; // واجهة الوايت
  FazaaScreen: undefined;
  AbsherCategory: undefined;
  ReviewScreen: { freelancerId: string };
  SelectLocation: { storageKey: string; title: string };
  RateDriver: { id: string };
  DeliveryAddresses: {
    selectedLocation?: { latitude: number; longitude: number };
  };

  // التوصيل
  DeliveryHome: undefined;
  CartScreen: undefined;
  MyOrdersScreen: undefined;
  OrderDetailsScreen: { order: any };
  CategoryDetails: { categoryName: string; categoryId: string };
  BusinessDetails:
    | { businessId: string }
    | { storeId: string }
    | { business: any };
  GroceryMainScreen: { categoryId: string };
  WalletScreen: undefined;

  // المعروف (المفقودات والموجودات)
  MaaroufList: undefined;
  MaaroufCreate: undefined;
  MaaroufDetails: { itemId: string };
  MaaroufEdit: { itemId: string };
  MaaroufChatList: undefined;
  MaaroufChat: { conversationId: string };

  // السند (خدمات متخصصة + فزعة + خيري)
  SanadList: undefined;
  SanadCreate: undefined;
  SanadDetails: { itemId: string };
  SanadEdit: { itemId: string };

  // الأماني (النقل النسائي للعائلات)
  AmaniList: undefined;
  AmaniCreate: undefined;
  AmaniDetails: { itemId: string };
  AmaniEdit: { itemId: string };

  // العربون (العروض والحجوزات بعربون)
  ArabonList: undefined;
  ArabonMyList: undefined;
  ArabonSearch: undefined;
  ArabonCreate: undefined;
  ArabonDetails: { itemId: string };
  ArabonEdit: { itemId: string };

  // الكوادر (الخدمات المهنية)
  KawaderList: undefined;
  KawaderCreate: undefined;
  KawaderDetails: { itemId: string };
  KawaderEdit: { itemId: string };
  KawaderChatList: undefined;
  KawaderChat: { conversationId: string };

  // كنز (السوق المفتوح)
  KenzList: undefined;
  KenzCreate: undefined;
  KenzDetails: { itemId: string };
  KenzEdit: { itemId: string };
  KenzChatList: undefined;
  KenzChat: { conversationId: string };

  // اسعفني (تبرع بالدم عاجل)
  Es3afniList: undefined;
  Es3afniCreate: undefined;
  Es3afniDetails: { itemId: string };
  Es3afniEdit: { itemId: string };

  // أخرى
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  Notifications: undefined;
  InvoiceScreen: { items: any[] };

  // التنقل العام
  MainApp: undefined;
};
