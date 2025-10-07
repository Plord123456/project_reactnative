
import { SafeAreaView, StyleSheet, View ,Text} from 'react-native';
import React from "react";
import HomeHeader from '@/components/HomeHeader';
import Wrapper from '@/components/Wrapper';
import AppColors from '@/constants/theme';


export default function HomeScreen() {
  const[featuredProducts,setFeaturedProducts]=React.useState([]);
  return (
    <View style={styles.Wrapper}>
      <HomeHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    backgroundColor: AppColors.background.primary,
  },
});
