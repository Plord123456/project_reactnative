import { StyleSheet,View,Text,  TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { useFavoritesStore } from "@/store/favortieStore";
// Ensure your store and type define 'favoritesItems'
import { router, useRouter } from "expo-router";
import Wrapper from "@/components/Wrapper";
import HomeHeader from "@/components/HomeHeader";
import AppColors from "@/constants/theme";
import ProductCard from "@/components/ProductCard";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptySate";
const FavoritesScreen = () => {
const {
  favoriteItems, // Make sure this exists in your store and type
  resetFavorite,
  isFavorite,
  toggleFavorite
} = useFavoritesStore();

const navigateToProducts=()=>{
  router.push('/(tabs)/shop');
}


  return (
<View style={{flex:1 }}>
      <HomeHeader />
     <Wrapper>
 {favoriteItems?.length > 0 ? (
  <>
    <View style={styles.headerView}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Favorites products list
        </Text>
        <Text style={styles.itemCount}>
          {favoriteItems.length} items
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => resetFavorite()}>
          <Text style={styles.resetText} > 
            Reset Favorite
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    <FlatList
      data={favoriteItems}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={styles.productContainer}>
          <Text>
            <ProductCard product={item} customStyle={{ width: "100%" }} />
          </Text>
        </View>
      )}
      contentContainerStyle={styles.productsGrid}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View style={styles.footer} />}
    />
  </>
 ) : (
    <EmptyState
      type="favorites"
      message="You have no favorite products yet."
      onAction={navigateToProducts}
    />
 )}
     </Wrapper>
    </View>
  );
};



export default FavoritesScreen;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.primary,
  },
  headerView: {
    paddingBottom: 5,
    backgroundColor: AppColors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray[200],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

header: {
  // Add valid style properties here if needed
},
resetText:{
  color:AppColors.error,
},
title: {
  fontFamily: "Inter-Bold",
  fontSize: 20,
  color: AppColors.text.primary,
},
itemCount: {
  fontFamily: "Inter-Regular",
  fontSize: 14,
  color: AppColors.text.secondary,
  marginTop: 2,
},
productsGrid: {
  paddingTop: 10,
},
columnWrapper: {
  justifyContent: "space-between",
},
productContainer: {
  width: "48%",
},
footer: {
  height:100,
}
});
  