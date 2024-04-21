import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors, Fonts, Roles } from "../constants";

import { useRoute } from "@react-navigation/native";

import { TouchableOpacity } from "react-native-gesture-handler";
import { Dropdown } from "react-native-element-dropdown";

import SuccessModel from "../components/models/SuccessModel";
import * as ImagePicker from "expo-image-picker";
import { getStaffMember, updateStaffMember } from "../services/StaffServices";
import { getRestaurants } from "../services/RestaurantServices";
import FailModel from "../components/models/FailModel";

const EmployeeScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [employee, setEmployee] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [restaurant, setRestaurant] = useState({});
  const [image, setImage] = useState("");
  const [showFailModal, setShowFailModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [showAddCustomizationModel, setShowAddCustomizationModel] =
    useState(false);

  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const roles = [
    { value: Roles.CASHIER, label: Roles.CASHIER },
    { value: Roles.MANAGER, label: Roles.MANAGER },
    { value: Roles.LIVREUR, label: Roles.LIVREUR },
  ];
  const fetchData = async () => {
    getStaffMember(id)
      .then((response) => {
        if (response.status) {
          setEmployee(response.data);
        } else {
          setShowFailModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  useEffect(() => {
    if (showFailModal) {
      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModal]);
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setUpdateMode(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);

  useEffect(() => {
    fetchData();
  }, []);
  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: Colors.screenBg,
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  const activateUpdateMode = async () => {
    setIsLoading(true);
    getRestaurants().then((response) => {
      if (response.status) {
        let list = [];
        response?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setRestaurants(list);
      }
    });
    setUpdateMode(true);
    setIsLoading(false);
  };

  const saveUpdates = async () => {
    if (employee.name.length < 1) {
      setError("Nom de l'employée manquant");
      return;
    }
    if (employee.username.length < 1) {
      setError("Nom d'utilisateur de l'employée manquant");
      return;
    }
    if (employee.password.length < 1) {
      setError("Mot de passe de l'employée manquant");
      return;
    }
    setIsLoading(true);
    const workAt = restaurant.id || employee.restaurant;

    updateStaffMember(
      id,
      employee.name,
      employee.username,
      workAt,
      employee.role
    )
      .then((response) => {
        if (response.status) {
          setEmployee(response.data);
          setShowSuccessModel(true);
        } else {
          setShowFailModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    // const formdata = new FormData();
    // if (image.length > 0) {
    //   formdata.append("file", {
    //     uri: image,
    //     type: mime.getType(image),
    //     name: image.split("/").pop(),
    //   });
    //   formdata.append("fileToDelete", employee.image);
    // }

    // formdata.append("name", employee.name);
    // formdata.append("username", employee.username);
    // formdata.append("password", employee.password);
    // formdata.append("restaurant", restaurant.id || employee.restaurant);
    // formdata.append("role", employee.role);

    // try {
    //   setIsLoading(true);
    //   const response = await fetch(`${API_URL}/staffs/update/${id}`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "multipart/form-data", // Set content type to application/json
    //     },
    //     body: JSON.stringify({
    //       name: employee.name,
    //       username: employee.username,
    //       password: employee.password,
    //       restaurant: restaurant.id || employee.restaurant,
    //       role: employee.role,
    //     }),
    //   });
    //   const data = await response.json();
    //   if (!response.ok) {
    //     throw new Error("HTTP error " + response.status);
    //   }
    //   setEmployee(data);
    //   setShowSuccessModel(true);
    // } catch (err) {
    //   setShowFailModal(true);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: Colors.screenBg }}>
        {showSuccessModel && <SuccessModel />}
        {showFailModal && (
          <FailModel message="Oops ! Quelque chose s'est mal passé" />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 20,
            marginHorizontal: 20,
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
              onPress={activateUpdateMode}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Modifier
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {error.length > 0 && (
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
              color: "red",
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        )}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Informations générale
          </Text>
          <View
            style={{
              backgroundColor: Colors.gry,
              borderRadius: 10,
              padding: 16,
              flexDirection: "row",
              marginTop: 20,
            }}
          >
            <View
              style={{
                width: 200,
                height: 200,
                backgroundColor: Colors.mgry,
                borderRadius: 10,
              }}
            >
              {employee.image && (
                <Image
                  source={{ uri: employee.image }}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "cover",
                    borderRadius: 10,
                  }}
                />
              )}
            </View>

            <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Nom:
                </Text>
                {updateMode ? (
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: Colors.primary,
                      paddingHorizontal: 5,
                      paddingVertical: 5,
                      paddingHorizontal: 8,
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                      width: "50%",
                    }}
                    value={employee.name}
                    onChangeText={(text) =>
                      setEmployee({ ...employee, name: text })
                    }
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    {employee.name}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Nom d'utilisateur:
                </Text>
                {updateMode ? (
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: Colors.primary,
                      paddingHorizontal: 5,
                      paddingVertical: 5,
                      paddingHorizontal: 8,
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                      width: "50%",
                    }}
                    value={employee.username}
                    onChangeText={(text) =>
                      setEmployee({ ...employee, username: text })
                    }
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    {employee.username}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Mot de passe:
                </Text>
                {updateMode && (
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: Colors.primary,
                      paddingHorizontal: 5,
                      paddingVertical: 5,
                      paddingHorizontal: 8,
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                      width: "50%",
                    }}
                    placeholder="Changer mot de passe"
                    onChangeText={(text) =>
                      setEmployee({ ...employee, password: text })
                    }
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 16,
              marginTop: 10,
              flexDirection: "row",
            }}
          >
            {employee.role != Roles.ADMIN && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Restaurant:
                </Text>
                {updateMode ? (
                  <Dropdown
                    style={[styles.dropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    selectedStyle={styles.selectedStyle}
                    itemContainerStyle={styles.itemContainerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={styles.containerStyle}
                    data={restaurants}
                    maxHeight={300}
                    labelField="label"
                    valueField="label"
                    placeholder="Réstaurant"
                    value={restaurant.name}
                    onChange={(item) => {
                      setRestaurant({ id: item.value, name: item.label });
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    {employee.restaurant.name}
                  </Text>
                )}
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 40,
              }}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Rôle:
              </Text>
              {updateMode ? (
                <Dropdown
                  style={[styles.dropdown]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedStyle={styles.selectedStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={roles}
                  maxHeight={300}
                  labelField="label"
                  valueField="label"
                  placeholder="Catégorie"
                  value={employee.role}
                  onChange={(item) =>
                    setEmployee({ ...employee, role: item.value })
                  }
                />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {employee.role}
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
    </KeyboardAvoidingView>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    width: 250,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,

    marginLeft: 10,
  },
  selectedStyle: {
    height: 18,
  },
  icon: {
    marginRight: 5,
  },
  itemContainerStyle: {
    padding: 0,
    margin: 0,
  },
  itemTextStyle: {
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 18,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 18,
    fontFamily: Fonts.LATO_REGULAR,
  },
});
