import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface RadioGroupProps<T extends string> {
  options: Option<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
}

function RadioGroup<T extends string>({
  options,
  selectedValue,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)} style={styles.option}>
          <View style={[styles.circle, selectedValue === opt.value && styles.selected]} />
          <Text style={styles.label}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    gap: 10,
  },
  option: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#aaa",
  },
  selected: {
    backgroundColor: "#444",
    borderColor: "#444",
  },
  label: {
    fontSize: 16,
  },
});

export default RadioGroup;
