import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

import { Colors, Fonts } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import { getItemsNames } from "../../services/MenuItemServices";
import Calender from "../Calender";
import AddItemModel from "./AddItemMode";

import SuccessModel from "./SuccessModel";
import { getToppings } from "../../services/ToppingsServices";
import AddToppingModel from "./AddToppingModel";
import * as ImagePicker from "expo-image-picker";

import mime from "mime";
import { API_URL } from "@env";
import FailModel from "./FailModel";

const CreateOfferModel = ({ setShowCreateOfferModel, setRefresh }) => {
  const { height: windowHeight } = useWindowDimensions();
  const modalHeight = Math.min(windowHeight * 0.9, 900);
  const [menuItems, setMenuItems] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showAddItemModel, setShowAddItemModel] = useState(false);
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [items, setItems] = useState([]);
  const [customizationsList, setCustomizationsList] = useState([]);
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [customizationsNames, setCustomizationsNames] = useState([]);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsNamesResponse, toppingResponse] = await Promise.all([
        getItemsNames(),
        getToppings(),
      ]);
      if (itemsNamesResponse.status) {
        let list = [];
        itemsNamesResponse.data.map((item) => {
          list.push({ value: item._id, label: item.name, prices: item.prices });
        });
        setMenuItems(list);
      } else {
      }
      if (toppingResponse.status) {
        setCustomizationsList(toppingResponse.data);
      } else {
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,

      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveItem = async () => {
    if (items.length < 1) {
      setError("Choisir au moin un article");
      return;
    }
    if (name.length < 1) {
      setError("Nom de l'offre manquant");
      return;
    }
    if (image.length < 1) {
      setError("Image de l'offre manquante");
      return;
    }
    if (price.length < 1) {
      setError("Prix de l'offre manquant");
      return;
    }
    if (date <= new Date()) {
      setError("Date invalide");
      return;
    }
    const formdata = new FormData();
    if (image) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
    }

    formdata.append("customizations", JSON.stringify(customizationsNames));
    formdata.append("items", JSON.stringify(items));
    formdata.append("name", name);
    formdata.append("price", price);
    formdata.append("expireAt", date.toISOString());

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/offers/create`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formdata,
      });
      const data = await response.json();

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
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setShowCreateOfferModel(false);
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
  const deleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  const deleteCustomization = (index) => {
    const newCustomizations = [...customizationsNames];
    newCustomizations.splice(index, 1);
    setCustomizationsNames(newCustomizations);
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setShowCreateOfferModel(false)}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {showAddItemModel && (
          <AddItemModel
            setItems={setItems}
            menuItems={menuItems}
            setShowAddItemModel={setShowAddItemModel}
          />
        )}
        {showAddCategoryModel && (
          <AddToppingModel
            setShowAddCategoryModel={setShowAddCategoryModel}
            toppings={customizationsList}
            setCustomizationsNames={setCustomizationsNames}
            customizationsNames={customizationsNames}
          />
        )}
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
        <View style={[styles.model, { height: modalHeight }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Ajouter une offre</Text>
              <Text style={styles.subtitle}>
                Ajoutez l'image, les infos, puis associez les articles
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateOfferModel(false)}
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
            nestedScrollEnabled
          >
            <View style={styles.topRow}>
              <View style={styles.imageColumn}>
                <Text style={styles.sectionTitle}>Image</Text>
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
                    placeholder="Nom de l'offre"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={(text) => setName(text)}
                    value={name}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Prix</Text>
                  <View style={styles.priceRow}>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      onChangeText={(text) => setPrice(text)}
                      keyboardType="numeric"
                      placeholder="Prix"
                      placeholderTextColor="#9CA3AF"
                      value={price}
                    />
                    <Text style={styles.priceSuffix}>$</Text>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Date d'expiration</Text>
                  <Calender setDate={setDate} date={date} />
                </View>
                <View style={[styles.card, styles.inlineCard]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.sectionTitle}>Articles</Text>
                    <Text style={styles.cardSubtitle}>
                      Ajoutez au moins un article à l'offre.
                    </Text>
                  </View>
                  <View style={styles.pillList}>
                    {items.map((item, index) => (
                      <View style={styles.pill} key={index}>
                        <Text style={styles.pillText}>
                          {item.item.name} x {item.quantity}
                        </Text>
                        <TouchableOpacity
                          style={styles.pillAction}
                          onPress={() => deleteItem(index)}
                        >
                          <AntDesign name="close" size={16} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addPill}
                      onPress={() => setShowAddItemModel(true)}
                    >
                      <Entypo name="plus" size={18} color="#1b1b1b" />
                      <Text style={styles.addPillText}>Ajouter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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

export default CreateOfferModel;

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
  inlineCard: {
    width: "100%",
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceInput: {
    flex: 1,
  },
  priceSuffix: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#111827",
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: "white",
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    gap: 2,
  },
  cardSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#6B7280",
  },
  pillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.gry,
    gap: 6,
  },
  pillText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#111827",
  },
  pillAction: {
    padding: 2,
  },
  addPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.primary,
  },
  addPillText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
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
});
