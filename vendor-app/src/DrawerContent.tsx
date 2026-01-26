import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from './constants/colors';

const DrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={styles.header}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>لوحة التاجر</Text>
      </View>
      <View style={styles.body}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.primaryVariant,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingTop: 10,
  },
});

export default DrawerContent;
