import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Colors, Fonts, Roles } from "../constants";
import { updateSettings } from "../services/SettingsServices";
import SuccessModel from "../components/models/SuccessModel";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getRestaurantSettings,
  getRestaurantsSettings,
} from "../services/RestaurantServices";
import ErrorScreen from "../components/ErrorScreen";
import FailModel from "../components/models/FailModel";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
const SettingsScreen = () => {
  const { role, restaurant } = useSelector(selectStaffData);

  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [data, setData] = useState();
  const [error, setError] = useState(false);
  const fetchData = async () => {
    setError(false);
    setIsLoading(true);
    try {
      if (role === Roles.ADMIN) {
        const response = await getRestaurantsSettings();

        if (response.status) {
          setRestaurants(response.data);
        } else {
          setError(true);
        }
      } else {
        const response = await getRestaurantSettings(restaurant);

        if (response.status) {
          setRestaurants([response.data]);
        } else {
          setError(true);
        }
      }
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const saveChanges = async (index) => {
    setErrorMessage("");
    const restaurant = restaurants[index];
    const settings = restaurant.settings;
    const formatTime = (value, type) => {
      let num = parseInt(value, 10);
      if (isNaN(num)) return null; // Invalid input
      if (type === "hours") {
        if (num < 0) return null;
        if (num > 23) return null;
      }
      if (type === "minutes") {
        if (num < 0) return null;
        if (num > 59) return null;
      }

      return num < 10 ? `0${num}` : `${num}`;
    };

    // Validate inputs
    const formattedOpenHours = formatTime(
      settings.working_hours.open.hours,
      "hours"
    );
    const formattedOpenMinutes = formatTime(
      settings.working_hours.open.minutes,
      "minutes"
    );
    const formattedCloseHours = formatTime(
      settings.working_hours.close.hours,
      "hours"
    );
    const formattedCloseMinutes = formatTime(
      settings.working_hours.close.minutes,
      "minutes"
    );
    const validDeliveryFee = parseFloat(settings.delivery_fee);

    if (
      formattedOpenHours === null ||
      formattedOpenMinutes === null ||
      formattedCloseHours === null ||
      formattedCloseMinutes === null
    ) {
      setErrorMessage(
        "Entrée de temps invalide. Veuillez vérifier les heures et les minutes."
      );
      console.error("Invalid time input. Please check the hours and minutes.");
      return;
    }

    if (
      parseInt(formattedCloseHours + formattedCloseMinutes, 10) <=
      parseInt(formattedOpenHours + formattedOpenMinutes, 10)
    ) {
      setErrorMessage(
        "L'heure de fermeture doit être supérieure à l'heure d'ouverture."
      );
      console.error("Close time must be greater than open time.");
      return;
    }

    if (isNaN(validDeliveryFee) || validDeliveryFee <= 0) {
      console.error("Delivery fee must be a positive number.");
      setErrorMessage("Les frais de livraison ne doivent pas être vides.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await updateSettings(restaurant._id, settings);

      if (response.status) {
        setShowSuccessModel(true);
      } else {
        setShowFailModal(true);
      }
    } catch (error) {
      console.error(error);
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchData();
  //   }, [])
  // );

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
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
  const handleTimeChange = (event, selectedDate, data) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const updatedTime = `${hours}:${minutes}`;

      // Update the open or close time
      setRestaurants((prevRestaurants) =>
        prevRestaurants.map((restaurant, i) =>
          i === data.index
            ? {
                ...restaurant,
                settings: {
                  ...restaurant.settings,
                  emploie_du_temps: {
                    ...restaurant.settings.emploie_du_temps,
                    [data.day]: {
                      ...restaurant.settings.emploie_du_temps[data.day],
                      [data.type]: updatedTime, // Update either "open" or "close"
                    },
                  },
                },
              }
            : restaurant
        )
      );
      setShowPicker(false);
    }
  };

  const handleTimePicker = (day, type, index) => {
    let time;
    if (type === "open") {
      const t = restaurants[index].settings.emploie_du_temps[day]?.open;
      time = new Date(`1970-01-01T${t}:00`);
    } else {
      const t = restaurants[index].settings.emploie_du_temps[day]?.close;
      time = new Date(`1970-01-01T${t}:00`);
    }
    setData({
      time,
      day,
      index,
      type,
    });
    setShowPicker(true);
  };

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size={"large"} color="black" />
      </View>
    );
  }
  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
        }}
      >
        <View style={{ height: 20 }}>
          {errorMessage !== "" && (
            <Text
              style={{
                color: "red",
                fontFamily: Fonts.LATO_REGULAR,
                textAlign: "center",
                fontSize: 16,
              }}
            >
              {errorMessage}
            </Text>
          )}
        </View>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Paramètre
        </Text>
        {restaurants.map((restaurant, index) => (
          <View
            style={{
              borderBottomWidth: index !== restaurants.length - 1 ? 2 : 0,
              borderColor: "black",
              paddingBottom: 20,
            }}
            key={index}
          >
            <Text style={[styles.title, { marginTop: 20 }]}>
              {restaurant.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={[styles.title]}>Ouvert:</Text>
              <Switch
                trackColor={{ false: "#767577", true: Colors.primary }}
                thumbColor="black"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() =>
                  setRestaurants((prevRestaurants) =>
                    prevRestaurants.map((restaurant, i) =>
                      i === index
                        ? {
                            ...restaurant,
                            settings: {
                              ...restaurant.settings,
                              open: !restaurant.settings.open,
                            },
                          }
                        : restaurant
                    )
                  )
                }
                value={restaurant.settings.open}
                style={{ marginLeft: 20 }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={[styles.title]}>Livraison:</Text>
              <Switch
                trackColor={{ false: "#767577", true: Colors.primary }}
                thumbColor="black"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() =>
                  setRestaurants((prevRestaurants) =>
                    prevRestaurants.map((restaurant, i) =>
                      i === index
                        ? {
                            ...restaurant,
                            settings: {
                              ...restaurant.settings,
                              delivery: !restaurant.settings.delivery,
                            },
                          }
                        : restaurant
                    )
                  )
                }
                value={restaurant.settings.delivery}
                style={{ marginLeft: 20 }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={[styles.title]}>Frais de livraison:</Text>
              <TextInput
                style={[
                  styles.text,
                  {
                    marginLeft: 20,
                    backgroundColor: "white",
                    borderRadius: 5,
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                    width: 50,
                  },
                ]}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setRestaurants((prevRestaurants) =>
                    prevRestaurants.map((restaurant, i) =>
                      i === index
                        ? {
                            ...restaurant,
                            settings: {
                              ...restaurant.settings,
                              delivery_fee: text,
                            },
                          }
                        : restaurant
                    )
                  )
                }
                value={restaurant.settings.delivery_fee.toString()}
                placeholder="0"
              />
              <Text style={[styles.title]}> $</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={[styles.title]}>Rayon de livraison:</Text>
              <TextInput
                style={[
                  styles.text,
                  {
                    marginLeft: 20,
                    backgroundColor: "white",
                    borderRadius: 5,
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                    width: 50,
                  },
                ]}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setRestaurants((prevRestaurants) =>
                    prevRestaurants.map((restaurant, i) =>
                      i === index
                        ? {
                            ...restaurant,
                            settings: {
                              ...restaurant.settings,
                              delivery_range: text,
                            },
                          }
                        : restaurant
                    )
                  )
                }
                value={restaurant.settings.delivery_range?.toString()}
                placeholder="0"
              />
              <Text style={[styles.title]}> km</Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.title]}>Heure d’ouverture:</Text>
              {Object.keys(restaurant.settings?.emploie_du_temps || {}).map(
                (day) => (
                  <View key={day} style={{ marginVertical: 10 }}>
                    <Text style={styles.text}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      {/* Open Time Picker */}
                      <TouchableOpacity
                        style={[styles.timePicker]}
                        onPress={() => handleTimePicker(day, "open", index)}
                      >
                        <Text style={styles.text}>
                          {restaurant.settings.emploie_du_temps[day]?.open ||
                            "Select Open Time"}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.text}> - </Text>

                      {/* Close Time Picker */}
                      <TouchableOpacity
                        style={[styles.timePicker]}
                        onPress={() => handleTimePicker(day, "close", index)}
                      >
                        <Text style={styles.text}>
                          {restaurant.settings.emploie_du_temps[day]?.close ||
                            "Select Close Time"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              )}
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                }}
                onPress={() => saveChanges(index)}
              >
                <Text style={styles.title}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {showPicker && (
          <DateTimePicker
            value={data.time}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              handleTimeChange(event, selectedDate, data)
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 24,
  },
  text: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },

  timePicker: {
    backgroundColor: "white",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
});
