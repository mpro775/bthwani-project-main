import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

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

  // عند اختيار التاريخ
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setPickerMode(null);
      return;
    }
    if (selectedDate) {
      // اذا اخترت تاريخ، انتقل لاختيار الوقت
      const tempDate = new Date(selectedDate);
      setDate(tempDate); // مؤقتًا
      setPickerMode("time");
    }
  };

  // عند اختيار الوقت
  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setPickerMode(null);
      return;
    }
    if (selectedTime && date) {
      // دمج الوقت مع اليوم المحدد
      const finalDate = new Date(date);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      finalDate.setSeconds(0);
      setDate(finalDate);
      onChange(finalDate);
      setPickerMode(null);
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
            <DateTimePicker
              value={date || minDate}
              mode="date"
              minimumDate={minDate}
              maximumDate={maxDate}
              display="default"
              onChange={onDateChange}
              locale="ar"
            />
          )}

          {pickerMode === "time" && (
            <DateTimePicker
              value={date || minDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
              locale="ar"
            />
          )}
        </View>
      )}
    </View>
  );
};

export default ScheduledDeliveryPicker;
