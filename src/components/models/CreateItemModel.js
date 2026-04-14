import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import { getCategories } from "../../services/MenuItemServices";
import { getToppings } from "../../services/ToppingsServices";
import { getToppingGroups } from "../../services/ToppingGroupsServices";
import { API_URL } from "@env";
import * as ImagePicker from "expo-image-picker";
import AddToppingModel from "./AddToppingModel";
import SuccessModel from "./SuccessModel";

import mime from "mime";
import FailModel from "./FailModel";
import { getSizesGroups } from "../../services/sizesGroupeServices";

const CreateItemModel = ({ setShowCreateItemModel, setRefresh }) => {
  const { height: windowHeight } = useWindowDimensions();
  const modalHeight = Math.min(windowHeight * 0.9, 900);
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [customizationsNames, setCustomizationsNames] = useState([]);
  const [toppingGroups, setToppingGroups] = useState([]);
  const [selectedToppingGroups, setSelectedToppingGroups] = useState([]);
  const [toppingGroupToAdd, setToppingGroupToAdd] = useState("");
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [name, setName] = useState("");
  const [showFailModal, setShowFailModal] = useState(false);
  const [image, setImage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [sizeGroups, setSizeGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupSizes, setGroupSizes] = useState([]);
  const [sizePrices, setSizePrices] = useState({});
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [
        categoriesResponse,
        toppingResponse,
        sizeGroupsResponse,
        toppingGroupsResponse,
      ] = await Promise.all([
        getCategories(),
        getToppings(),
        getSizesGroups(),
        getToppingGroups(),
      ]);

      if (categoriesResponse?.status) {
        setCategories(categoriesResponse?.data);
        const mappedCats =
          categoriesResponse?.data.map((item) => ({
            value: item.name,
            label: item.name,
          })) || [];
        setCategoriesNames(mappedCats);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }

      if (toppingResponse?.status) {
        setToppings(toppingResponse?.data);
      } else {
        console.error("topping data not found:", toppingResponse.message);
      }

      if (sizeGroupsResponse?.status) {
        setSizeGroups(sizeGroupsResponse?.data || []);
      }

      if (toppingGroupsResponse?.status) {
        setToppingGroups(toppingGroupsResponse?.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    const group = sizeGroups.find((g) => g._id === groupId);
    const mappedSizes = group?.sizes || [];
    setGroupSizes(mappedSizes);
    setSizePrices((prev) => {
      const next = { ...prev };
      mappedSizes.forEach((size) => {
        if (next[size._id] === undefined) {
          next[size._id] = "";
        }
      });
      return next;
    });
  };

  const handlePriceChange = (sizeId, value) => {
    const normalized = value.replace(",", ".");
    setSizePrices((prev) => ({ ...prev, [sizeId]: normalized }));
  };

  const saveItem = async () => {
    if (image.length < 1) {
      setError("Image de l'article manquante");
      return;
    }
    if (name.length < 1) {
      setError("Nom de l'article manquant");
      return;
    }
    if (!categoryName) {
      setError("Catégorie de l'article manquante");
      return;
    }
    if (!selectedGroupId) {
      setError("Sélectionnez un groupe de tailles");
      return;
    }
    if (groupSizes.length < 1) {
      setError("Le groupe choisi ne contient pas de tailles");
      return;
    }
    const pricesPayload = [];
    for (const size of groupSizes) {
      const value = sizePrices[size._id];
      if (value === undefined || value === null || value === "") {
        setError(`Ajoutez un prix pour ${size.name}`);
        return;
      }
      const numericPrice = parseFloat(value);
      if (Number.isNaN(numericPrice)) {
        setError(`Prix invalide pour ${size.name}`);
        return;
      }
      pricesPayload.push({ size: size.name, price: numericPrice });
    }

    let categoryId = "";
    categories.map((item) => {
      if (item.name === categoryName) {
        categoryId = item._id;
      }
    });
    const customization = customizationsNames.map((item) => {
      return item._id;
    });
    const customizationGroup = selectedToppingGroups.map((group) => group._id);
    setError("");
    const formdata = new FormData();
    if (image) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
    }
    formdata.append("customization", JSON.stringify(customization));
    formdata.append("customizationGroup", JSON.stringify(customizationGroup));
    formdata.append("prices", JSON.stringify(pricesPayload));
    formdata.append("name", name);
    formdata.append("category", categoryId);
    formdata.append("description", description);
    setIsloading(true);

    try {
      const response = await fetch(`${API_URL}/menuItems/create`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formdata,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();

      setShowSuccessModel(true);
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsloading(false);
    }
  };

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
  const deleteCustomization = (index) => {
    const newCustomizations = [...customizationsNames];
    newCustomizations.splice(index, 1);
    setCustomizationsNames(newCustomizations);
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setShowCreateItemModel(false);
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
      onRequestClose={() => setShowCreateItemModel(false)}
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
        {showAddCategoryModel && (
          <AddToppingModel
            setShowAddCategoryModel={setShowAddCategoryModel}
            toppings={toppings}
            setCustomizationsNames={setCustomizationsNames}
            customizationsNames={customizationsNames}
          />
        )}
        <View style={[styles.model, { height: modalHeight }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ajouter un article</Text>
            <Text style={styles.subtitle}>
              Ajoutez l'image, les infos, puis associez prix et
              personnalisations.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCreateItemModel(false)}
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
          <View style={styles.formGrid}>
            <View style={styles.leftColumn}>
              <Text style={styles.sectionTitle}>Image</Text>
              <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
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

              <View style={styles.field}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Pizza Margherita"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={(text) => setName(text)}
                  value={name}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Décrivez brièvement l'article."
                  placeholderTextColor="#9CA3AF"
                  onChangeText={(text) => setDescription(text)}
                  value={description}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.field}>
                <Text style={styles.label}>Catégorie</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={categoriesNames}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Sélectionner une catégorie"
                  value={categoryName}
                  onChange={(item) => {
                    setCategoryName(item.value);
                  }}
                />
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Prix par taille</Text>
                  <Text style={styles.cardSubtitle}>
                    Choisissez un groupe et renseignez un prix pour chaque
                    taille.
                  </Text>
                </View>
                <Dropdown
                  style={[styles.dropdown, { marginTop: 6 }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={sizeGroups.map((g) => ({
                    label: g.name,
                    value: g._id,
                  }))}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Sélectionner un groupe de tailles"
                  value={selectedGroupId}
                  onChange={(item) => handleSelectGroup(item.value)}
                />
                <View style={styles.sizeList}>
                  {selectedGroupId && groupSizes.length > 0 ? (
                    groupSizes.map((size) => (
                      <View key={size._id} style={styles.sizeRow}>
                        <Text style={styles.sizeLabel}>{size.name}</Text>
                        <TextInput
                          style={styles.priceInput}
                          placeholder="Prix"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="decimal-pad"
                          value={
                            sizePrices[size._id] !== undefined
                              ? String(sizePrices[size._id])
                              : ""
                          }
                          onChangeText={(text) =>
                            handlePriceChange(size._id, text)
                          }
                        />
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyTitle}>
                        Sélectionnez un groupe de tailles
                      </Text>
                      <Text style={styles.emptySubtitle}>
                        Les tailles du groupe apparaîtront ici avec un champ
                        prix.
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Personnalisations</Text>
                </View>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={toppingGroups.map((g) => ({
                    label: g.name,
                    value: g._id,
                  }))}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Ajouter un groupe de personnalisations"
                  value={toppingGroupToAdd}
                  onChange={(item) => {
                    setToppingGroupToAdd("");
                    const found = toppingGroups.find((g) => g._id === item.value);
                    if (!found) {
                      return;
                    }
                    setSelectedToppingGroups((prev) => {
                      if (prev.some((group) => group._id === found._id)) {
                        return prev;
                      }
                      return [...prev, found];
                    });
                  }}
                />
                {selectedToppingGroups.length > 0 ? (
                  <View style={styles.customizationList}>
                    {selectedToppingGroups.map((group) => (
                      <View key={group._id} style={styles.pill}>
                        <Text style={styles.pillText}>{group.name}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedToppingGroups((prev) =>
                              prev.filter((item) => item._id !== group._id)
                            )
                          }
                        >
                          <AntDesign name="close" size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
          <Text style={styles.saveLabel}>Ajouter</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateItemModel;

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
    zIndex: 30,
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
  formGrid: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap",
  },
  leftColumn: {
    flex: 1,
    gap: 14,
  },
  rightColumn: {
    flex: 1,
    gap: 16,
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
  textArea: {
    height: 120,
    textAlignVertical: "top",
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
  sizeList: {
    gap: 10,
  },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.gry,
  },
  sizeLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#111827",
  },
  priceInput: {
    width: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "white",
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: Colors.gry,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#111827",
  },
  emptySubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#6B7280",
  },
  infoBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.gry,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBadgeText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
  },
  customizationList: {
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
  },
  pillText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#111827",
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
