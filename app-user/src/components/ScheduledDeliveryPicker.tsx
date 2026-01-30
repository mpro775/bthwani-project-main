import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Switch, Text, TouchableOpacity, View } from "react-native";

import COLORS from "@/constants/colors";

type Props = {
  onChange: (date: Date | null) => void;
};

const ScheduledDeliveryPicker: React.FC<Props> = ({ onChange }) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  // للتحكم في عرض البيكر: 'date' أو 'time' أو null
  const [pickerMode, setPickerMode] = useState<null | "date" | "time">(null);

  // تحديد أقل وأعلى يوم
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(minDate.getDate() + 2);

  // دالة تفعيل الجدولة
  const toggleSwitch = () => {
    setIsScheduled(!isScheduled);
    if (!isScheduled) {
      setPickerMode("date");
    } else {
      setDate(null);
      onChange(null);
    }
  };

  // عند اختيار التاريخ (تأجيل الإغلاق لتجنب خطأ dismiss في أندرويد)
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setTimeout(() => setPickerMode(null), 100);
      return;
    }
    if (selectedDate) {
      const tempDate = new Date(selectedDate);
      setDate(tempDate);
      setPickerMode("time");
    }
  };

  // عند اختيار الوقت
  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event?.type === "dismissed") {
      setTimeout(() => setPickerMode(null), 100);
      return;
    }
    if (selectedTime && date) {
      const finalDate = new Date(date);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      finalDate.setSeconds(0);
      setDate(finalDate);
      if (Platform.OS !== "android") {
        onChange(finalDate);
        setPickerMode(null);
      }
    }
  };

  // عرض موعد التوصيل النصي
  const displayText = date
    ? `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "لم يتم اختيار الموعد";

  return (
    <View style={{ marginVertical: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontSize: 16, fontFamily: "Cairo-Bold", color: COLORS.blue }}
        >
          طلب مجدول
        </Text>
        <Switch value={isScheduled} onValueChange={toggleSwitch} />
      </View>

      {isScheduled && (
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              marginBottom: 5,
              fontFamily: "Cairo-Regular",
              fontSize: 14,
              color: COLORS.blue,
            }}
          >
            اختر تاريخ ووقت التوصيل (خلال ٣ أيام قادمة):
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#f2f2f2",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              marginTop: 5,
              minHeight: 40,
            }}
            onPress={() => setPickerMode("date")}
          >
            <Text style={{ color: COLORS.blue, fontFamily: "Cairo-Bold" }}>
              {displayText}
            </Text>
          </TouchableOpacity>

          {pickerMode === "date" && (
            <View style={{ marginTop: 8 }}>
              <DateTimePicker
                value={date || minDate}
                mode="date"
                minimumDate={minDate}
                maximumDate={maxDate}
                display={Platform.OS === "android" ? "spinner" : "default"}
                onChange={onDateChange}
                locale="ar"
              />
              {Platform.OS === "android" && (
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    paddingVertical: 10,
                    backgroundColor: COLORS.blue,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setDate(date || minDate);
                    setPickerMode("time");
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "Cairo-SemiBold", fontSize: 16 }}>
                    التالي
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {pickerMode === "time" && (
            <View style={{ marginTop: 8 }}>
              <DateTimePicker
                value={date || minDate}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "android" ? "spinner" : "default"}
                onChange={onTimeChange}
                locale="ar"
              />
              {Platform.OS === "android" && (
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    paddingVertical: 10,
                    backgroundColor: COLORS.blue,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (date) {
                      onChange(date);
                      setPickerMode(null);
                    }
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "Cairo-SemiBold", fontSize: 16 }}>
                    تم
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ScheduledDeliveryPicker;
