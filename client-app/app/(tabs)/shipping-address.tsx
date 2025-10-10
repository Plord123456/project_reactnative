import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

import Wrapper from '@/components/Wrapper';
import CommonHeader from '@/components/CommonHeader';
import AppColors from '@/constants/theme';
import { Address, useAddressStore } from '@/store/addressStore';

const ShippingAddressScreen = () => {
  const router = useRouter();
  const { addresses, isLoading, fetchAddresses, addAddress } = useAddressStore();
  const [isAdding, setIsAdding] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setStreet('');
    setCity('');
    setCountry('');
  };

  const handleAddAddress = async () => {
    if (!street.trim() || !city.trim() || !country.trim()) {
      Alert.alert('Missing information', 'Please fill in street, city and country.');
      return;
    }

    const success = await addAddress({
      street: street.trim(),
      city: city.trim(),
      country: country.trim(),
    });

    if (!success) {
      Alert.alert('Add failed', 'Could not add address. Please try again.');
      return;
    }

    setIsAdding(false);
    resetForm();
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <Text style={styles.addressTitle}>{item.street}</Text>
      <Text style={styles.addressSubtitle}>{`${item.city ?? ''}${item.city && item.country ? ', ' : ''}${item.country ?? ''}`}</Text>
    </View>
  );

  return (
    <Wrapper>
      <CommonHeader title="Shipping Addresses" onBackPress={() => router.push('/(tabs)/profile')} />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding((prev) => !prev)}
            disabled={isLoading}
          >
            <FontAwesome5 name={isAdding ? 'times' : 'plus'} size={16} color={AppColors.background.primary} />
            <Text style={styles.addButtonText}>{isAdding ? 'Cancel' : 'Add New Address'}</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>You have no saved addresses yet.</Text>
          ) : null
        }
      />

      {isLoading && <ActivityIndicator style={styles.loader} color={AppColors.primary[500]} />}

      {isAdding && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Street Address"
            style={styles.input}
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            placeholder="City"
            style={styles.input}
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            placeholder="Country"
            style={styles.input}
            value={country}
            onChangeText={setCountry}
          />
          <TouchableOpacity
            style={[styles.saveButton, (isLoading || !street.trim() || !city.trim() || !country.trim()) && styles.saveButtonDisabled]}
            onPress={handleAddAddress}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary[500],
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  addButtonText: {
    color: AppColors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: AppColors.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.gray[100],
    gap: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  addressSubtitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: AppColors.text.secondary,
  },
  loader: {
    marginTop: 8,
  },
  formContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: AppColors.gray[100],
    backgroundColor: AppColors.background.primary,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.gray[200],
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  saveButton: {
    backgroundColor: AppColors.primary[500],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: AppColors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShippingAddressScreen;
