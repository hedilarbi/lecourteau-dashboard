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
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";

import { createReward } from "../../services/RewardServices";
import { getItemsNames } from "../../services/MenuItemServices";
import SuccessModel from "./SuccessModel";
import FailModel from "./FailModel";

const CreateRewardModel = ({ setShowCreateRewardModel, setRefresh }) => {
  const { height: windowHeight } = useWindowDimensions();
  const modalHeight = Math.min(windowHeight * 0.85, 720);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [points, setPoints] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [error, setError] = useState("");
  const [showFailModal, setShowFailModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getItemsNames();
      if (response.status) {
        const list = response.data.map((menuItem) => ({
          value: menuItem._id,
          label: menuItem.name,
        }));
        setItems(list);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveItem = async () => {
    if (Object.keys(item).length < 1) {
      setError("Article manquant");
      return;
    }
    if (points.length < 1) {
      setError("Nombre de points manquant");
      return;
    }
    createReward(points, item.id).then((response) => {
      if (response.status) {
        setShowSuccessModel(true);
        setRefresh((prev) => prev + 1);
      } else {
        setShowFailModal(true);
      }
    });
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setShowCreateRewardModel(false);
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
      onRequestClose={() => setShowCreateRewardModel(false)}
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
              <Text style={styles.title}>Ajouter une récompense</Text>
              <Text style={styles.subtitle}>
                Sélectionnez l'article et définissez les points.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateRewardModel(false)}
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
              <Text style={styles.label}>Article</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemContainerStyle={styles.itemContainerStyle}
                itemTextStyle={styles.itemTextStyle}
                containerStyle={styles.containerStyle}
                data={items}
                maxHeight={260}
                labelField="label"
                valueField="label"
                placeholder="Choisir un article"
                value={item.name}
                onChange={(nextItem) => {
                  setItem({ id: nextItem.value, name: nextItem.label });
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Points</Text>
              <TextInput
                style={styles.input}
                placeholder="1200"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={points}
                onChangeText={(text) => setPoints(text)}
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

export default CreateRewardModel;

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
    maxWidth: 720,
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
    paddingBottom: 16,
    gap: 14,
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
