// app/(tabs)/shipping-detail.tsx
import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal, TouchableOpacity, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
const DEFAULT_COUNTRY = 'United States of America';
import { useAuthStore } from '@/store/auth';
import { useAddressStore } from '@/store/addressStore';

import Wrapper from '@/components/Wrapper';
import CommonHeader from '@/components/CommonHeader';
import AppColors from '@/constants/theme';
import TextInput from '@/components/Textinput';
import Button from '@/components/Button';

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const ShippingDetailScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { address, fetchAddress, updateAddress, loading } = useAddressStore();

  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [stateSearch, setStateSearch] = useState('');
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [pendingState, setPendingState] = useState('');
  const [pendingCity, setPendingCity] = useState('');
  const [pendingZip, setPendingZip] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddress();
    }
  }, [user]);

  const populateForm = (addr?: any) => {
    setPhone(addr?.phone ?? '');
    setStreet(addr?.street ?? '');
    setCity(addr?.city ?? '');
    setStateProvince(addr?.state ?? '');
    setPostalCode(addr?.postal_code ?? '');
    setCountry(addr?.country ?? DEFAULT_COUNTRY);
    setPendingState(addr?.state ?? '');
    setPendingCity(addr?.city ?? '');
    setPendingZip(addr?.postal_code ?? '');
  };

  useEffect(() => {
    if (address) {
      populateForm(address);
      setIsEditing(false);
    } else {
      populateForm(undefined);
      setIsEditing(true);
    }
  }, [address]);

  const filteredStates = useMemo(() => {
    const query = stateSearch.trim().toLowerCase();
    if (!query) return US_STATES;
    return US_STATES.filter((item) =>
      item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)
    ); 
  }, [stateSearch]);

  const performSave = async () => {
    if (!user) return;
    try {
      await updateAddress({ phone, street, city, state: stateProvince, postal_code: postalCode, country });
      Alert.alert('Success', 'Shipping details saved successfully.');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save shipping details.');
    }
  };

  const handleSavePress = () => {
    if (!phone || !street || !city || !postalCode || !country) {
      Alert.alert('Missing Information', 'Please fill in all required fields, including phone number and address.');
      return;
    }

    // Hiển thị hộp thoại xác nhận
    Alert.alert(
      "Confirm Changes", // Title
      "Are you sure you want to save these changes?", // Message
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { 
          text: "Confirm", 
          onPress: performSave // Chỉ gọi hàm lưu khi người dùng xác nhận
        }
      ]
    );
  };

  const hasAddress = Boolean(address && (
    address.street || address.city || address.state || address.postal_code || address.country
  ));

  const handleEditPress = () => {
    populateForm(address);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (address) {
      populateForm(address);
      setIsEditing(false);
    }
  };

  return (
    <Wrapper>
      <CommonHeader
        title="Shipping Details"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.push('/(tabs)/profile');
        }}
      />
      <ScrollView>
        <View style={styles.container}>
          {loading && !address ? (
            <ActivityIndicator style={{ marginTop: 30 }} size="large" color={AppColors.primary[500]} />
          ) : !isEditing && hasAddress ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Saved address</Text>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Phone</Text>
                <Text style={styles.summaryValue}>{address?.phone || '—'}</Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Street</Text>
                <Text style={styles.summaryValue}>{address?.street || '—'}</Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>City / State</Text>
                <Text style={styles.summaryValue}>
                  {(() => {
                    const parts = [address?.city, address?.state].filter(Boolean);
                    const cityState = parts.length ? parts.join(', ') : '—';
                    return `${cityState}${address?.postal_code ? ` ${address.postal_code}` : ''}`;
                  })()}
                </Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Country</Text>
                <Text style={styles.summaryValue}>{address?.country || '—'}</Text>
              </View>
              <Button title="Edit Address" onPress={handleEditPress} fullWidth style={{ marginTop: 24 }} />
            </View>
          ) : (
            <>
              <TextInput 
                placeholder="Phone Number*" 
                value={phone} 
                onChangeText={setPhone} 
                keyboardType="phone-pad" 
              />
              <TextInput placeholder="Street*" value={street} onChangeText={setStreet} />
              <Text style={styles.selectorLabel}>State, City & ZIP*</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => {
                  setPendingState(stateProvince);
                  setPendingCity(city);
                  setPendingZip(postalCode);
                  setStateSearch('');
                  setStateModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={stateProvince ? styles.selectorValue : styles.selectorPlaceholder}>
                  {stateProvince ? `${stateProvince} • ${city || 'City'} • ${postalCode || 'ZIP'}` : 'Select State, City & ZIP'}
                </Text>
              </TouchableOpacity>
              <TextInput placeholder="Country*" value={country} onChangeText={setCountry} />
              <View style={styles.formActions}>
                {address && (
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleCancelEdit}
                    style={{ flex: 1, marginRight: 12 }}
                  />
                )}
                <Button
                  onPress={handleSavePress}
                  disabled={loading}
                  loading={loading}
                  title="Save Details"
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={stateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select State</Text>
            <TextInput
              placeholder="Search state"
              value={stateSearch}
              onChangeText={setStateSearch}
            />
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isSelected = pendingState === item.code;
                return (
                  <TouchableOpacity
                    style={[styles.stateItem, isSelected && styles.stateItemSelected]}
                    onPress={() => {
                      setPendingState(item.code);
                      setCountry(DEFAULT_COUNTRY);
                    }}
                  >
                    <Text style={styles.stateName}>{item.name}</Text>
                    <Text style={styles.stateCode}>{item.code}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TextInput
              placeholder="City"
              value={pendingCity}
              onChangeText={setPendingCity}
              style={{ marginTop: 12 }}
            />
            <TextInput
              placeholder="ZIP / Postal Code"
              value={pendingZip}
              onChangeText={setPendingZip}
              style={{ marginTop: 12 }}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setStateSearch('');
                  setStateModalVisible(false);
                }}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save"
                onPress={() => {
                  setStateProvince(pendingState);
                  setCity(pendingCity);
                  setPostalCode(pendingZip);
                  setStateSearch('');
                  setStateModalVisible(false);
                }}
                style={{ flex: 1 }}
                disabled={!pendingState || !pendingCity || !pendingZip}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  selector: {
    borderWidth: 1,
    borderColor: AppColors.gray[200],
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
  },
  selectorLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  selectorPlaceholder: {
    color: AppColors.gray[400],
    fontSize: 16,
  },
  selectorValue: {
    color: AppColors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: AppColors.background.secondary,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  summaryBlock: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: AppColors.background.secondary,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray[200],
  },
  stateItemSelected: {
    backgroundColor: AppColors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  stateName: {
    fontSize: 16,
    color: AppColors.text.primary,
  },
  stateCode: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

export default ShippingDetailScreen;