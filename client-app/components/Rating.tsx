import { Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather, AntDesign } from '@expo/vector-icons';
import AppColors from '@/constants/theme';

interface RatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, size=16, showCount=true }) => {

  const roundedRating = Math.round(rating*2)/2;
  
  const renderStars = () => {
    const stars = [];
    // full stars
    for(let i=1;i<=Math.floor(roundedRating);i++){
      stars.push(<AntDesign key={`star-${i}`} 
        name="star" 
        size={size} 
        color={AppColors.accent[500]} />);
    }
    
if (roundedRating % 1 !== 0) {
  stars.push(
    <View key="half-star" style={styles.halfStarContainer}>
      <AntDesign
        name="star"
        style={styles.halfStarBackground}
        size={size}
        color={AppColors.accent[500]}
      />
      <Feather
        name="star"
        style={styles.halfStarOverlay}
        size={size}
        color={AppColors.accent[500]}
      />
    </View>
  );
}
    // empty stars
 const emptyStars = 5 - Math.ceil(roundedRating);
for (let i = 1; i <= emptyStars; i++) {
  stars.push(
    <Feather
      name="star"
      key={`empty-star-${i}`}
      size={size}
      color={AppColors.accent[500]}
    />
  );
}
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer} >
      {renderStars()}
      </View>
      {showCount && count !== undefined &&  <Text style={styles.count}>
        ({count})
        </Text>}

    </View>
  );
};

export default Rating;
const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "android" ? 35 : 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfStarContainer: {
    position: 'relative',
    width: 16, // match your star size
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfStarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 16,
    height: 16,
    opacity: 0.3,
  },
  halfStarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 8, // half of the star width
    height: 16,
    overflow: 'hidden',
  },

  count: {
    marginLeft: 4,
    color: AppColors.text.secondary,
    fontSize: 14,
  },
  // Ensure all stars have the same size and alignment
  star: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});