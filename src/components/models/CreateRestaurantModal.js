import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
      setError("Nom du réstaurant manquant");
      return;
    }
    if (address.length < 1) {
      setError("Adresse du réstaurant manquante");
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
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);

        setShowCreateRestaurantModal(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModal) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showFailModal]);
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);

        setShowCreateRestaurantModal(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);

  return (
    <View style={styles.container}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      {isLoading && (
        <View
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            width: "100%",
            height: "100%",
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <ActivityIndicator size={"large"} color="black" />
        </View>
      )}
      <View style={styles.model}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Ajouter un réstaurant
          </Text>
          <TouchableOpacity onPress={() => setShowCreateRestaurantModal(false)}>
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
        </View>
        {error.length > 0 && (
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
              textAlign: "center",
              color: "red",
            }}
          >
            {error}
          </Text>
        )}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", marginTop: 30 }}>
            <Text style={[styles.text, { marginTop: 10 }]}>Adresse</Text>

            <GooglePlacesAutocomplete
              placeholder="Adresse"
              onPress={(data, details) => handlePlaceSelect(data, details)}
              query={{
                key: `${GOOGLE_MAPS_API_KEY}`,
                language: "en",
              }}
              styles={{
                container: {
                  marginLeft: 20,
                },
                textInputContainer: {
                  borderColor: Colors.primary,
                  borderWidth: 2,
                },
                textInput: {
                  fontSize: 20,
                },
              }}
            />
          </View>
          <View style={styles.name}>
            <Text style={styles.text}>Nom</Text>
            <TextInput
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 20,
                padding: 10,
                borderWidth: 2,
                borderColor: Colors.primary,
                marginLeft: 20,
                flex: 1,
              }}
              placeholder="Nom du réstaurant"
              placeholderTextColor={Colors.tgry}
              onChangeText={(text) => setName(text)}
            />
          </View>

          <View style={styles.name}>
            <Text style={styles.text}>Téléphone</Text>
            <TextInput
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 20,
                padding: 10,
                borderWidth: 2,
                borderColor: Colors.primary,
                marginLeft: 20,
                flex: 1,
              }}
              keyboardType="numeric"
              placeholder="Téléphone"
              placeholderTextColor={Colors.tgry}
              onChangeText={(text) => setPhoneNumber(text)}
            />
          </View>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 40,
            alignSelf: "flex-end",
            backgroundColor: Colors.primary,
            paddingHorizontal: 60,
            paddingVertical: 10,
            borderRadius: 5,
          }}
          onPress={saveItem}
        >
          <Text style={styles.text}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "80%",
  },
  image: { flexDirection: "row", marginTop: 40, alignItems: "center" },
  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  name: {
    flexDirection: "row",
    marginTop: 30,
    alignItems: "center",
  },

  priceBox: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  prices: { flexDirection: "row", alignItems: "center" },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,

    borderRadius: 5,
    marginLeft: 10,
  },
  customizations: {
    marginTop: 40,
  },
});
