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
import React, { useEffect, useState } from "react";
import { Colors, Fonts, Roles } from "../constants";
import { updateSettings } from "../services/SettingsServices";
import SuccessModel from "../components/models/SuccessModel";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getRestaurantSettings,
  getRestaurantsSettings,
} from "../services/RestaurantServices";
import ErrorScreen from "../components/ErrorScreen";
import FailModel from "../components/models/FailModel";
import { useSelector } from "react-redux";
import { selectStaffData, selectStaffToken } from "../redux/slices/StaffSlice";
import PageHeader from "../components/ui/PageHeader";
const SettingsScreen = () => {
  const { role, restaurant } = useSelector(selectStaffData);
  const token = useSelector(selectStaffToken);
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
      "hours",
    );
    const formattedOpenMinutes = formatTime(
      settings.working_hours.open.minutes,
      "minutes",
    );
    const formattedCloseHours = formatTime(
      settings.working_hours.close.hours,
      "hours",
    );
    const formattedCloseMinutes = formatTime(
      settings.working_hours.close.minutes,
      "minutes",
    );
    const validDeliveryFee = parseFloat(settings.delivery_fee);

    if (
      formattedOpenHours === null ||
      formattedOpenMinutes === null ||
      formattedCloseHours === null ||
      formattedCloseMinutes === null
    ) {
      setErrorMessage(
        "Entrée de temps invalide. Veuillez vérifier les heures et les minutes.",
      );
      console.error("Invalid time input. Please check the hours and minutes.");
      return;
    }

    if (
      parseInt(formattedCloseHours + formattedCloseMinutes, 10) <=
      parseInt(formattedOpenHours + formattedOpenMinutes, 10)
    ) {
      setErrorMessage(
        "L'heure de fermeture doit être supérieure à l'heure d'ouverture.",
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
      const response = await updateSettings(restaurant._id, settings, token);

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
            : restaurant,
        ),
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
    <SafeAreaView style={styles.screen}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Paramètres"
          subtitle="Configurez vos horaires, livraisons et disponibilité."
          pills={[
            { label: `${restaurants.length} restaurant(s)` },
            errorMessage ? { label: "Erreur" } : null,
          ].filter(Boolean)}
        />

        {errorMessage !== "" && (
          <View style={styles.alert}>
            <Text style={styles.alertText}>{errorMessage}</Text>
          </View>
        )}

        {restaurants.map((restaurant, index) => (
          <View key={restaurant._id || index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{restaurant.name}</Text>
                <Text style={styles.cardSubtitle}>
                  Ajustez les préférences et horaires de cet établissement.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveChanges(index)}
                activeOpacity={0.9}
              >
                <Text style={styles.saveLabel}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ouvert</Text>
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
                        : restaurant,
                    ),
                  )
                }
                value={restaurant.settings.open}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Livraison</Text>
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
                        : restaurant,
                    ),
                  )
                }
                value={restaurant.settings.delivery}
              />
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frais de livraison</Text>
                <View style={styles.inlineField}>
                  <TextInput
                    style={styles.input}
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
                            : restaurant,
                        ),
                      )
                    }
                    value={restaurant.settings.delivery_fee.toString()}
                    placeholder="0"
                    placeholderTextColor={Colors.tgry}
                  />
                  <Text style={styles.suffix}>$</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rayon de livraison</Text>
                <View style={styles.inlineField}>
                  <TextInput
                    style={styles.input}
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
                            : restaurant,
                        ),
                      )
                    }
                    value={restaurant.settings.delivery_range?.toString()}
                    placeholder="0"
                    placeholderTextColor={Colors.tgry}
                  />
                  <Text style={styles.suffix}>km</Text>
                </View>
              </View>
            </View>

            <View style={styles.schedule}>
              <Text style={styles.sectionTitle}>Heures d’ouverture</Text>
              <View style={styles.daysGrid}>
                {Object.keys(restaurant.settings?.emploie_du_temps || {}).map(
                  (day) => (
                    <View key={day} style={styles.dayCard}>
                      <Text style={styles.dayLabel}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                      <View style={styles.timeRow}>
                        <TouchableOpacity
                          style={styles.timePicker}
                          onPress={() => handleTimePicker(day, "open", index)}
                        >
                          <Text style={styles.timeLabel}>
                            {restaurant.settings.emploie_du_temps[day]?.open ||
                              "--:--"}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.timeSeparator}>—</Text>
                        <TouchableOpacity
                          style={styles.timePicker}
                          onPress={() => handleTimePicker(day, "close", index)}
                        >
                          <Text style={styles.timeLabel}>
                            {restaurant.settings.emploie_du_temps[day]?.close ||
                              "--:--"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ),
                )}
              </View>
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
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
  },
  alert: {
    backgroundColor: "rgba(225,79,79,0.08)",
    borderColor: "rgba(225,79,79,0.25)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  alertText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#C43131",
  },
  card: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 30,
    color: "#1b1b1b",
  },
  cardSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: Colors.tgry,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  saveLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  inputGroup: {
    flex: 1,
    minWidth: 180,
    gap: 6,
  },
  inlineField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#1b1b1b",
  },
  suffix: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: Colors.tgry,
  },
  schedule: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    minWidth: 150,
    gap: 8,
  },
  dayLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timePicker: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 78,
    alignItems: "center",
  },
  timeLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  timeSeparator: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
  },
});
