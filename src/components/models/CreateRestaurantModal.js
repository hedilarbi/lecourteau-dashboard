import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Colors, Fonts } from "../../constants";
import SuccessModel from "./SuccessModel";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import { createRestaurant } from "../../services/RestaurantServices";
import FailModel from "./FailModel";

const CreateRestaurantModal = ({
  setShowCreateRestaurantModal,
  setRefresh,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const modalHeight = Math.min(windowHeight * 0.85, 720);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePlaceSelect = async (data, details) => {
    const { description } = details;
    setAddress(description);
  };

  const saveItem = async () => {
    if (name.length < 1) {
      setError("Nom du restaurant manquant");
      return;
    }
    if (address.length < 1) {
      setError("Adresse du restaurant manquante");
      return;
    }
    if (phoneNumber.length < 1) {
      setError("Téléphone du restaurant manquant");
      return;
    }
    try {
      setIsLoading(true);
      let location;
      const response = await Location.geocodeAsync(address);
      if (response.length > 0) {
        const { latitude, longitude } = response[0];
        location = {
          latitude,
          longitude,
        };
      }

      createRestaurant(name, address, location, phoneNumber).then(
        (response) => {
          if (response.status) {
            setShowSuccessModel(true);
          }
        }
      );
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setShowCreateRestaurantModal(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);

  useEffect(() => {
    if (showFailModal) {
      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModal]);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setShowCreateRestaurantModal(false)}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {showSuccessModel && <SuccessModel />}
        {showFailModal && (
          <FailModel message="Oops ! Quelque chose s'est mal passé" />
        )}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size={"large"} color="black" />
          </View>
        )}

        <View style={[styles.model, { height: modalHeight }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Ajouter un restaurant</Text>
              <Text style={styles.subtitle}>
                Renseignez l'adresse, le nom et le téléphone.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateRestaurantModal(false)}
            >
              <AntDesign name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {error.length > 0 && <Text style={styles.errorBanner}>{error}</Text>}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <Text style={styles.label}>Adresse</Text>
              <GooglePlacesAutocomplete
                placeholder="Adresse"
                onPress={(data, details) => handlePlaceSelect(data, details)}
                query={{
                  key: `${GOOGLE_MAPS_API_KEY}`,
                  language: "en",
                }}
                onFail={(errorMessage) => console.error(errorMessage)}
                styles={{
                  container: styles.placesContainer,
                  textInputContainer: styles.placesInputContainer,
                  textInput: styles.placesInput,
                  listView: styles.placesList,
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom du restaurant"
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => setName(text)}
                value={name}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Téléphone"
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => setPhoneNumber(text)}
                value={phoneNumber}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
            <Text style={styles.saveLabel}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateRestaurantModal;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(50,44,44,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  model: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: "95%",
    maxWidth: 900,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 24,
    color: "#111827",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gry,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    backgroundColor: "rgba(225,79,79,0.12)",
    borderColor: "rgba(225,79,79,0.4)",
    borderWidth: 1,
    color: Colors.danger,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 20,
    gap: 16,
    flexGrow: 1,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    backgroundColor: Colors.gry,
    color: "#111827",
  },
  placesContainer: {
    flex: 0,
  },
  placesInputContainer: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.gry,
    paddingHorizontal: 6,
  },
  placesInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "transparent",
    height: 46,
  },
  placesList: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: "white",
  },
  saveButton: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  saveLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  loadingOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
