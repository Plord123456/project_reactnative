// app/(tabs)/shipping-detail.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Wrapper from "@/components/Wrapper";
import CommonHeader from "@/components/CommonHeader";
import AppColors from "@/constants/theme";
import TextInput from "@/components/Textinput";
import Button from "@/components/Button";
import Loader from "@/components/loader";
import { useAuthStore } from "@/store/auth";
import { useAddressStore, Address } from "@/store/addressStore";

type City = { name: string; zipCodes: string[] };
type State = { code: string; name: string; cities: City[] };
type ModalStep = "state" | "city" | "zip";

const DEFAULT_COUNTRY = "United States of America";
const US_LOCATIONS: State[] = [
  {
    code: "CA",
    name: "California",
    cities: [
      { name: "Los Angeles", zipCodes: ["90001", "90002", "90003", "90004", "90005"] },
      { name: "San Francisco", zipCodes: ["94102", "94103", "94104", "94105", "94107"] },
      { name: "San Diego", zipCodes: ["92101", "92102", "92103", "92104", "92105"] },
    ],
  },
  {
    code: "NY",
    name: "New York",
    cities: [
      { name: "New York City", zipCodes: ["10001", "10002", "10003", "10004", "10005"] },
      { name: "Buffalo", zipCodes: ["14201", "14202", "14203", "14204", "14205"] },
      { name: "Rochester", zipCodes: ["14602", "14603", "14604", "14605", "14606"] },
    ],
  },
  {
    code: "TX",
    name: "Texas",
    cities: [
      { name: "Houston", zipCodes: ["77001", "77002", "77003", "77004", "77005"] },
      { name: "Dallas", zipCodes: ["75201", "75202", "75203", "75204", "75205"] },
      { name: "Austin", zipCodes: ["73301", "73344", "78701", "78702", "78703"] },
    ],
  },
];

const ShippingDetailScreen = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const { address, loading: addressLoading, fetchAddress, updateAddress } = useAddressStore();

    const [form, setForm] = useState<Address>({
        phone: "", street: "", city: "", state: "", postal_code: "", country: DEFAULT_COUNTRY,
    });
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [modalStep, setModalStep] = useState<ModalStep>("state");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedZip, setSelectedZip] = useState("");

    useEffect(() => {
        if (!user) {
            Alert.alert("Please login", "You need to sign in to manage your shipping address.", [
                { text: "OK", onPress: () => router.push("/login") },
            ]);
            return;
        }
        fetchAddress();
    }, [user]);

    useEffect(() => {
        if (address) {
            setForm({
                phone: address.phone ?? "", street: address.street ?? "", city: address.city ?? "",
                state: address.state ?? "", postal_code: address.postal_code ?? "",
                country: address.country ?? DEFAULT_COUNTRY,
            });
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [address]);
  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return US_LOCATIONS;
    return US_LOCATIONS.filter(
      (state) => state.name.toLowerCase().includes(query) || state.code.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const filteredCities = useMemo(() => {
    if (!selectedState) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return selectedState.cities;
    return selectedState.cities.filter((city) => city.name.toLowerCase().includes(query));
  }, [selectedState, searchQuery]);

  const filteredZipCodes = useMemo(() => {
    if (!selectedCity) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return selectedCity.zipCodes;
    return selectedCity.zipCodes.filter((zip) => zip.includes(query));
  }, [selectedCity, searchQuery]);

  const openLocationModal = () => {
    const foundState = US_LOCATIONS.find((state) => state.code === form.state) ?? null;
    const foundCity = foundState?.cities.find((city) => city.name === form.city) ?? null;
    setSelectedState(foundState);
    setSelectedCity(foundCity);
    setSelectedZip(foundCity?.zipCodes.includes(form.postal_code) ? form.postal_code : "");
    setSearchQuery("");
    setModalStep(foundState ? (foundCity ? (form.postal_code ? "zip" : "zip") : "city") : "state");
    setLocationModalVisible(true);
  };

  const handleStateSelect = (state: State) => {
    setSelectedState(state);
    setSelectedCity(null);
    setSelectedZip("");
    setSearchQuery("");
    setModalStep("city");
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setSelectedZip("");
    setSearchQuery("");
    setModalStep("zip");
  };

  const handleZipSelect = (zip: string) => {
    setSelectedZip(zip);
  };

const handleSaveLocation = () => {
        if (selectedState && selectedCity && selectedZip) {
            setForm(prev => ({ ...prev, state: selectedState.code, city: selectedCity.name, postal_code: selectedZip }));
            setLocationModalVisible(false);
        }
    };

  const handleBackInModal = () => {
    if (modalStep === "city") {
      setModalStep("state");
      setSearchQuery("");
    } else if (modalStep === "zip") {
      setModalStep("city");
      setSearchQuery("");
    }
  };

  const validate = () => {
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.street.trim()) return "Street address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.postal_code.trim()) return "Postal code is required.";
    if (!form.country.trim()) return "Country is required.";
    return null;
  };

  const handleSavePress = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Alert.alert("Validation", errorMsg);
      return;
    }
    setSaving(true);
        try {
            await updateAddress(form);
            Toast.show({ type: "success", text1: "Address saved!", position: "bottom" });
            setIsEditing(false);
            if (router.canGoBack()) router.back();
        } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Unable to save address.");
        } finally {
            setSaving(false);
        }
    };

    if (addressLoading) return <Loader />;

  const handleCancelEdit = () => {
    if (address) {
      setForm({
        phone: address.phone ?? "",
        street: address.street ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        postal_code: address.postal_code ?? "",
        country: address.country ?? DEFAULT_COUNTRY,
      });
    }
    setIsEditing(false);
  };

  const renderStateList = () => (
        <FlatList data={filteredStates} keyExtractor={item => item.code} renderItem={({ item }) => (
            <TouchableOpacity style={[styles.locationItem, selectedState?.code === item.code && styles.locationItemSelected]} onPress={() => handleStateSelect(item)}>
                <View><Text style={styles.locationPrimaryText}>{item.name}</Text><Text style={styles.locationSecondaryText}>{item.code}</Text></View>
                <Text style={styles.locationCount}>{item.cities.length} cities</Text>
            </TouchableOpacity>
        )} />
    );

  const hasAddress =
    !!address && (address.street || address.city || address.state || address.postal_code || address.country);

  if (addressLoading) return <Loader />;

  return (
    <Wrapper>
      <CommonHeader title="My Shipping Address" onBackPress={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {isEditing ? (
            <>
              <TextInput
                label="Phone"
                value={form.phone}
                onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                placeholder="(123) 456-7890"
              />
              <TextInput
                label="Street Address"
                value={form.street}
                onChangeText={(text) => setForm((prev) => ({ ...prev, street: text }))}
                placeholder="123 Main Street"
              />
              <Text style={styles.selectorLabel}>State, City & ZIP Code</Text>
              <TouchableOpacity style={styles.selector} onPress={openLocationModal} activeOpacity={0.8}>
                <Text style={form.state ? styles.selectorValue : styles.selectorPlaceholder}>
                  {form.state ? `${form.state} • ${form.city} • ${form.postal_code}` : "Select State, City & ZIP"}
                </Text>
              </TouchableOpacity>
              <TextInput
                label="Country"
                value={form.country}
                onChangeText={(text) => setForm((prev) => ({ ...prev, country: text }))}
                placeholder="United States"
              />
              <View style={styles.formActions}>
                {hasAddress && (
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleCancelEdit}
                    style={{ flex: 1, marginRight: 12 }}
                  />
                )}
                <Button
                  title="Save Address"
                  onPress={handleSavePress}
                  loading={saving}
                  disabled={saving}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Saved Address</Text>
              {hasAddress ? (
                <>
                  <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>Phone</Text>
                    <Text style={styles.summaryValue}>{address?.phone}</Text>
                  </View>
                  <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>Street</Text>
                    <Text style={styles.summaryValue}>{address?.street}</Text>
                  </View>
                  <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>City / State / ZIP</Text>
                    <Text style={styles.summaryValue}>
                      {address?.city}, {address?.state} {address?.postal_code}
                    </Text>
                  </View>
                  <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>Country</Text>
                    <Text style={styles.summaryValue}>{address?.country}</Text>
                  </View>
                  <Button title="Edit Address" onPress={() => setIsEditing(true)} fullWidth style={{ marginTop: 24 }} />
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No shipping address yet. Add one to continue.</Text>
                  <Button title="Add Address" onPress={() => setIsEditing(true)} fullWidth style={{ marginTop: 16 }} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={locationModalVisible} animationType="slide" transparent onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {modalStep !== "state" && (
                <TouchableOpacity onPress={handleBackInModal}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.modalTitle}>
                {modalStep === "state"
                  ? "Select State"
                  : modalStep === "city"
                  ? `Select City - ${selectedState?.name}`
                  : `Select ZIP - ${selectedCity?.name}, ${selectedState?.code}`}
              </Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={`Search ${modalStep}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />

            <View style={styles.modalListContainer}>
              {modalStep === "state" ? renderStateList() : modalStep === "city" ? renderCityList() : renderZipList()}
            </View>

            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>
                {selectedState && `State: ${selectedState.name}`}
                {selectedCity && ` • City: ${selectedCity.name}`}
                {selectedZip && ` • ZIP: ${selectedZip}`}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setLocationModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Location"
                onPress={handleSaveLocation}
                style={{ flex: 2 }}
                disabled={!selectedState || !selectedCity || !selectedZip}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: 20, gap: 16 },
  selector: {
    borderWidth: 1,
    borderColor: AppColors.gray[200],
    borderRadius: 12,
    padding: 16,
    backgroundColor: AppColors.background.primary,
  },
  selectorLabel: { fontSize: 16, fontWeight: "600", color: AppColors.text.primary },
  selectorPlaceholder: { color: AppColors.gray[400], fontSize: 16 },
  selectorValue: { color: AppColors.text.primary, fontSize: 16, fontWeight: "500" },
  summaryCard: {
    backgroundColor: AppColors.background.secondary,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  summaryTitle: { fontSize: 20, fontWeight: "700", color: AppColors.text.primary },
  summaryBlock: { gap: 4 },
  summaryLabel: { fontSize: 14, color: AppColors.text.secondary, fontWeight: "500" },
  summaryValue: { fontSize: 16, fontWeight: "400", color: AppColors.text.primary },
  emptyState: { alignItems: "center", paddingVertical: 20 },
  emptyStateText: { textAlign: "center", color: AppColors.text.secondary, fontSize: 16, lineHeight: 24 },
  formActions: { flexDirection: "row", marginTop: 24 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: AppColors.background.primary, borderRadius: 16, padding: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backButtonText: { fontSize: 16, color: AppColors.primary, fontWeight: "600" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: AppColors.text.primary, textAlign: "center" },
  closeButtonText: { fontSize: 18, color: AppColors.text.secondary, fontWeight: "600" },
  searchInput: { marginBottom: 16 },
  modalListContainer: { maxHeight: 300, minHeight: 200 },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray[100],
  },
  locationItemSelected: { backgroundColor: "#E3F2FD", borderRadius: 8 },
  locationPrimaryText: { fontSize: 16, color: AppColors.text.primary, fontWeight: "500" },
  locationSecondaryText: { fontSize: 14, color: AppColors.text.secondary, marginTop: 2 },
  locationCount: {
    fontSize: 12,
    color: AppColors.text.secondary,
    backgroundColor: AppColors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedInfo: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: AppColors.gray[200], marginTop: 16 },
  selectedInfoText: { fontSize: 14, color: AppColors.text.secondary, textAlign: "center" },
  modalActions: { flexDirection: "row", marginTop: 16, gap: 8 },
});

export default ShippingDetailScreen;