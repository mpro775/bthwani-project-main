import React from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import BusinessProductItem from "./BusinessProductItem";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: any;
  isFavorite?: boolean;
}

interface Props {
  products: Product[];
  storeId: string;
  storeType: "restaurant" | "grocery" | "shop";
  onAdd: (item: Product, quantity: number) => void;
  onToggleFavorite: (item: Product) => void;
}

const CARD_MARGIN = 7;
const ITEM_WIDTH = (Dimensions.get("window").width - 3 * CARD_MARGIN - 16) / 2; // 2 items, 16 padding

const BusinessProductList: React.FC<Props> = ({
  products,
  storeId,
  storeType,
  onAdd,
  onToggleFavorite,
}) => {
  return (
    <FlatList
      testID="products-flatlist"
      data={products}
      numColumns={2}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ width: ITEM_WIDTH, margin: CARD_MARGIN }}>
          <BusinessProductItem
            product={item}
            storeId={storeId}
            storeType={storeType}
            onAdd={onAdd}
            isFavorite={!!item.isFavorite}
            onToggleFavorite={() => onToggleFavorite(item)}
          />
        </View>
      )}
      ListEmptyComponent={
        <View testID="empty-list" style={styles.emptyWrap}>
          {/* يمكنك وضع رسالة فارغة هنا */}
        </View>
      }
    />
  );
};

export default BusinessProductList;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 8,
    paddingBottom: 24,
    backgroundColor: "#FFF",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  emptyWrap: { padding: 20 },
});
