import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  getRestaurant,
  updateRestaurant,
} from "../services/RestaurantServices";

import { Colors, Fonts } from "../constants";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import SuccessModel from "../components/models/SuccessModel";
import FailModel from "../components/models/FailModel";

const RestaurantScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateMode, setUpdateMode] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const handlePlaceSelect = async (data, details) => {
    const { description } = details;
    setRestaurant({ ...restaurant, address: description });
  };
  const fetchData = async () => {
    setIsLoading(true);
    getRestaurant(id)
      .then((response) => {
        if (response.status) {
          setRestaurant(response.data);
        } else {
          setShowFailModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setUpdateMode(false);
      }, 2000);

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
    fetchData();
  }, []);

  const saveUpdates = async () => {
    if (restaurant.name.length < 1) {
      setError("Nom du réstaurant manquant");
      return;
    }
    if (restaurant.address.length < 1) {
      setError("Adresse du réstaurant manquante");
      return;
    }
    if (restaurant.phone_number.length < 1) {
      setError("Téléphone du restaurant manquant");
      return;
    }
    try {
      setIsLoading(true);

      const response = await Location.geocodeAsync(restaurant.address);
      if (response.length > 0) {
        const { latitude, longitude } = response[0];
        const location = {
          latitude,
          longitude,
        };
        setRestaurant({ ...restaurant, location });
      }
      updateRestaurant(restaurant._id, restaurant).then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
          setRestaurant(response.data);
        } else {
          setShowFailModal(true);
        }
      });
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.screenBg,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.screenBg }}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {updateMode ? (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.gry,
                borderRadius: 5,
                alignItems: "center",
                paddingHorizontal: 30,
                paddingVertical: 10,
              }}
              onPress={() => setUpdateMode(false)}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Annuler
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 5,
                alignItems: "center",
                paddingHorizontal: 30,
                paddingVertical: 10,
              }}
              onPress={() => setUpdateMode(true)}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Modifier
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Informations Générale
          </Text>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              marginTop: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: updateMode ? "flex-start" : "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 20,
                  marginTop: updateMode ? 10 : 0,
                }}
              >
                Address:
              </Text>
              {updateMode ? (
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
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 20,
                  }}
                >
                  {restaurant.address}
                </Text>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Nom:
              </Text>
              {updateMode ? (
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
                  value={restaurant.name}
                  onChangeText={(text) =>
                    setRestaurant({ ...restaurant, name: text })
                  }
                />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 20,
                  }}
                >
                  {restaurant.name}
                </Text>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Téléphone:
              </Text>
              {updateMode ? (
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
                  value={restaurant.phone_number}
                  onChangeText={(text) =>
                    setRestaurant({ ...restaurant, phone_number: text })
                  }
                />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 20,
                  }}
                >
                  {restaurant.phone_number}
                </Text>
              )}
            </View>
          </View>
        </View>
        {updateMode && (
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 10,
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              onPress={() => saveUpdates()}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Sauvegarder
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default RestaurantScreen;
