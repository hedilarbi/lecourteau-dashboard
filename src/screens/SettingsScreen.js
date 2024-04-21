import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Colors, Fonts } from "../constants";

import { getSettings, updateSettings } from "../services/SettingsServices";
import SuccessModel from "../components/models/SuccessModel";
import { useFocusEffect } from "@react-navigation/native";
const SettingsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [refresh, setRefresh] = useState(0);
  const openMinutesInput = useRef(null);
  const closeMinutesInput = useRef(null);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [error, setError] = useState(false);
  const fetchData = async () => {
    setIsLoading(true);
    getSettings()
      .then((response) => {
        if (response.status) {
          setSettings(response.data.settings[0]);
          setError(false);
        } else {
          setError(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const saveChanges = async () => {
    try {
      setIsLoading(true);
      const response = await updateSettings(settings);

      if (response.status) {
        console.log(response.data);
        setSettings(response.data);
        setShowSuccessModel(true);
      } else {
        setShowFailModal(true);
      }
    } catch (error) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }
  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {showSuccessModel && <SuccessModel />}
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Paramètre
        </Text>
        {isLoading ? (
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
        ) : (
          <View>
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.title]}>Heures d'ouverture:</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={styles.text}>Ouverture:</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 10,
                      backgroundColor: "white",
                      borderRadius: 5,
                      padding: 5,
                    }}
                  >
                    <TextInput
                      style={[{}, styles.text]}
                      keyboardType="numeric"
                      value={settings?.working_hours.open.hours}
                      placeholder="00"
                      onChangeText={(text) => {
                        setSettings({
                          ...settings,
                          working_hours: {
                            ...settings.working_hours,
                            open: {
                              ...settings.working_hours.open,
                              hours: text,
                            },
                          },
                        });
                        if (text.length === 2) {
                          openMinutesInput.current.focus();
                        }
                      }}
                    />
                    <Text style={styles.text}> : </Text>
                    <TextInput
                      value={settings?.working_hours?.open.minutes}
                      style={[{}, styles.text]}
                      keyboardType="numeric"
                      ref={openMinutesInput}
                      onChangeText={(text) => {
                        setSettings({
                          ...settings,
                          working_hours: {
                            ...settings.working_hours,
                            open: {
                              ...settings.working_hours.open,
                              minutes: text,
                            },
                          },
                        });
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                    marginLeft: 50,
                  }}
                >
                  <Text style={styles.text}>Fermeture:</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 10,
                      backgroundColor: "white",
                      borderRadius: 5,
                      padding: 5,
                    }}
                  >
                    <TextInput
                      style={[{}, styles.text]}
                      keyboardType="numeric"
                      value={settings?.working_hours?.close.hours}
                      onChangeText={(text) => {
                        setSettings({
                          ...settings,
                          working_hours: {
                            ...settings.working_hours,
                            close: {
                              ...settings.working_hours.close,
                              hours: text,
                            },
                          },
                        });
                        if (text.length === 2) {
                          closeMinutesInput.current.focus();
                        }
                      }}
                    />
                    <Text style={styles.text}> : </Text>
                    <TextInput
                      value={settings?.working_hours.close.minutes}
                      style={[{}, styles.text]}
                      keyboardType="numeric"
                      ref={closeMinutesInput}
                      onChangeText={(text) => {
                        setSettings({
                          ...settings,
                          working_hours: {
                            ...settings.working_hours,
                            close: {
                              ...settings.working_hours.close,
                              minutes: text,
                            },
                          },
                        });
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
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
                  setSettings({ ...settings, open: !settings.open })
                }
                value={settings.open}
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
                  setSettings({ ...settings, delivery: !settings.delivery })
                }
                value={settings.delivery}
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
                  },
                ]}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setSettings({ ...settings, delivery_fee: text })
                }
                value={settings.delivery_fee.toString()}
                placeholder="0"
              />
            </View>
          </View>
        )}
      </View>
      <View
        style={{
          justifyContent: "flex-end",
          flexDirection: "row",
          marginBottom: 80,
          marginRight: 80,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
          }}
          onPress={saveChanges}
        >
          <Text style={styles.title}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
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
});
