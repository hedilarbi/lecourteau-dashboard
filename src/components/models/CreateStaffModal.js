import {
  ActivityIndicator,
  Image,
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
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts, Roles } from "../../constants";

import SuccessModel from "./SuccessModel";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import { API_URL } from "@env";
import { getRestaurants } from "../../services/RestaurantServices";
import FailModel from "./FailModel";

const CreateStaffModal = ({ setShowCreateStaffModal, setRefresh }) => {
  const { height: windowHeight } = useWindowDimensions();
  const modalHeight = Math.min(windowHeight * 0.9, 900);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [restaurant, setRestaurant] = useState({});
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFailModal, setShowFailModal] = useState(false);
  const [error, setError] = useState("");
  const roles = [
    { value: Roles.CASHIER, label: Roles.CASHIER },
    { value: Roles.MANAGER, label: Roles.MANAGER },
    { value: Roles.LIVREUR, label: Roles.LIVREUR },
  ];

  const fetchData = async () => {
    try {
      const response = await getRestaurants();
      if (response.status) {
        let list = [];
        response?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setRestaurants(list);
      }
    } catch (fetchError) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveItem = async () => {
    if (name.length < 1) {
      setError("Nom de l'employé manquant");
      return;
    }
    if (username.length < 1) {
      setError("Nom d'utilisateur de l'employé manquant");
      return;
    }
    if (password.length < 1) {
      setError("Mot de passe de l'employé manquant");
      return;
    }
    if (Object.keys(restaurant).length < 1) {
      setError("Il faut choisir un restaurant");
      return;
    }
    if (role.length < 1) {
      setError("Il faut choisir un rôle");
      return;
    }

    const formdata = new FormData();
    if (image.length > 0) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
    }

    formdata.append("name", name);
    formdata.append("username", username);
    formdata.append("password", password);
    formdata.append("restaurant", restaurant.id);
    formdata.append("role", role);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/staffs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formdata,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      setShowSuccessModel(true);
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
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
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setRefresh((prev) => prev + 1);
        setShowSuccessModel(false);
        setShowCreateStaffModal(false);
      }, 2000);

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
      onRequestClose={() => setShowCreateStaffModal(false)}
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
              <Text style={styles.title}>Ajouter un employé</Text>
              <Text style={styles.subtitle}>
                Ajoutez la photo et les informations de l'employé.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateStaffModal(false)}
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
            <View style={styles.topRow}>
              <View style={styles.imageColumn}>
                <Text style={styles.sectionTitle}>Photo</Text>
                <TouchableOpacity
                  style={styles.imageUpload}
                  onPress={pickImage}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <Entypo name="camera" size={36} color="#6B7280" />
                      <Text style={styles.uploadLabel}>
                        Cliquez pour importer
                      </Text>
                      <Text style={styles.uploadHint}>JPG ou PNG</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.detailsColumn}>
                <View style={styles.field}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={(text) => setName(text)}
                    value={name}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Nom d'utilisateur</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nom d'utilisateur"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={(text) => setUsername(text)}
                    value={username}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                  />
                </View>
              </View>
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.field, styles.rowField]}>
                <Text style={styles.label}>Restaurant</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={restaurants}
                  maxHeight={300}
                  labelField="label"
                  valueField="label"
                  placeholder="Restaurant"
                  value={restaurant.name}
                  onChange={(selected) => {
                    setRestaurant({ id: selected.value, name: selected.label });
                  }}
                />
              </View>
              <View style={[styles.field, styles.rowField]}>
                <Text style={styles.label}>Rôle</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={roles}
                  maxHeight={300}
                  labelField="label"
                  valueField="label"
                  placeholder="Rôle"
                  value={role}
                  onChange={(selected) => {
                    setRole(selected.value);
                  }}
                />
              </View>
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

export default CreateStaffModal;

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
    maxWidth: 1100,
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
    gap: 20,
    flexGrow: 1,
  },
  topRow: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap",
  },
  imageColumn: {
    flex: 1,
    maxWidth: 320,
    minWidth: 240,
    gap: 14,
  },
  detailsColumn: {
    flex: 1,
    minWidth: 320,
    gap: 14,
  },
  sectionTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#111827",
  },
  imageUpload: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    backgroundColor: Colors.gry,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  imagePreview: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  uploadLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#374151",
  },
  uploadHint: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#9CA3AF",
  },
  field: {
    gap: 6,
  },
  rowFields: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  rowField: {
    flex: 1,
    minWidth: 260,
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
  dropdown: {
    height: 46,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.gry,
  },
  itemContainerStyle: {
    paddingVertical: 8,
  },
  itemTextStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_REGULAR,
    color: "#111827",
  },
  containerStyle: {
    marginTop: -25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_REGULAR,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_BOLD,
    color: "#111827",
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
    zIndex: 100000,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
