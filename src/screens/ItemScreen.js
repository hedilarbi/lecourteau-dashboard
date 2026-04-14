import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors, Fonts } from "../constants";
import { getCategories, getMenuItem } from "../services/MenuItemServices";
import { useRoute } from "@react-navigation/native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Dropdown } from "react-native-element-dropdown";
import AddToppingModel from "../components/models/AddToppingModel";
import { getToppings } from "../services/ToppingsServices";
import { getToppingGroups } from "../services/ToppingGroupsServices";
import SuccessModel from "../components/models/SuccessModel";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@env";
import mime from "mime";
import FailModel from "../components/models/FailModel";
import AddMenuItemPrice from "../components/models/AddMenuItemPrice";

import { getSizes } from "../services/SizesServices";
import BackButton from "../components/BackButton";
const ItemScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [menuItem, setMenuItem] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState({});
  const [description, setDescription] = useState("");
  const [customization, setCustomization] = useState([]);
  const [prices, setPrices] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [showAddCustomizationModel, setShowAddCustomizationModel] =
    useState(false);
  const [toppings, setToppings] = useState([]);
  const [toppingGroups, setToppingGroups] = useState([]);
  const [selectedToppingGroups, setSelectedToppingGroups] = useState([]);
  const [toppingGroupToAdd, setToppingGroupToAdd] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);

  const deriveGroups = (data, groupsList = []) => {
    const raw = data?.customization_group || data?.customizationGroup;
    if (!raw) return [];
    const rawList = Array.isArray(raw) ? raw : [raw];

    return rawList
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "object") {
          return { _id: entry._id || "", name: entry.name || "" };
        }
        const found =
          groupsList.find((group) => group._id === entry || group.name === entry) ||
          null;
        if (!found) {
          return typeof entry === "string" ? { _id: entry, name: entry } : null;
        }
        return { _id: found._id, name: found.name };
      })
      .filter((group) => group?._id);
  };

  const fetchData = async () => {
    getMenuItem(id)
      .then((response) => {
        if (response.status) {
          setMenuItem(response.data);
          setSelectedToppingGroups(deriveGroups(response.data));
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

      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setUpdateMode(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (showFailModal) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showFailModal]);

  const activateUpdateMode = async () => {
    setIsLoading(true);
    let groupsRes;
    try {
      const [categoriesResponse, toppingResponse, sizeResponse, groupsResult] =
        await Promise.all([
          getCategories(),
          getToppings(),
          getSizes(),
          getToppingGroups(),
        ]);
      groupsRes = groupsResult;

      if (categoriesResponse?.status) {
        const nextCategories =
          categoriesResponse?.data?.map((item) => ({
            value: item._id,
            label: item.name,
          })) || [];
        setCategoriesNames(nextCategories);
      } else {
        setShowFailModal(true);
      }
      if (sizeResponse?.status) {
        setSizes(
          sizeResponse?.data.map((size) => ({
            label: size.name,
            value: size.name,
          })),
        );
      }
      if (toppingResponse?.status) {
        setToppings(toppingResponse?.data);
      } else {
        console.error("topping data not found:", toppingResponse.message);
      }
      if (groupsRes?.status) {
        setToppingGroups(groupsRes.data || []);
        setSelectedToppingGroups(deriveGroups(menuItem, groupsRes.data || []));
        setToppingGroupToAdd("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setName(menuItem?.name || "");
      setDescription(menuItem?.description || "");
      setCategory({
        label: menuItem?.category?.name || "",
        value: menuItem?.category?._id || "",
      });
      setPrices(menuItem?.prices || []);
      setCustomization(menuItem?.customization || []);

      setUpdateMode(true);

      setIsLoading(false);
    }
  };
  const updatePrice = (newPrice, index) => {
    const updatedPrices = [...prices];

    updatedPrices[index] = { ...updatedPrices[index], price: newPrice };

    setPrices(updatedPrices);
  };

  const deleteFromCustomization = (index) => {
    const updatedList = customization.filter((item, i) => i !== index);
    setCustomization(updatedList);
  };

  const deleteFromPrices = (index) => {
    const updatedList = prices.filter((item, i) => i !== index);
    setPrices(updatedList);
  };

  const saveUpdates = async () => {
    if (name.length < 1) {
      setError("Nom de l'article manquant");
      return;
    }
    if (prices.length < 1) {
      setError("Ajouter au moin un prix ");
      return;
    }
    if (description.length < 1) {
      setError("Description de l'article manquante");
      return;
    }
    const formdata = new FormData();
    if (image.length > 0) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
      formdata.append("fileToDelete", menuItem.image);
    }
    formdata.append("customization", JSON.stringify(customization));
    formdata.append(
      "customizationGroup",
      JSON.stringify(selectedToppingGroups.map((group) => group._id))
    );
    formdata.append("prices", JSON.stringify(prices));
    formdata.append("name", name);
    formdata.append("category", category.value);
    formdata.append("description", description);
    setIsLoading(true);
    setError("");
    try {
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries < maxRetries && !success) {
        const response = await fetch(`${API_URL}/menuItems/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formdata,
        });

        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }

        const data = await response.json();

        setMenuItem(data);
        setShowSuccessModel(true);
        success = true;
      }

      if (!success) {
        throw new Error("Network request failed after multiple retries");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {showAddCustomizationModel && (
        <AddToppingModel
          setShowAddCategoryModel={setShowAddCustomizationModel}
          setCustomizationsNames={setCustomization}
          toppings={toppings}
          customizationsNames={customization}
        />
      )}
      {showAddPriceModal && (
        <AddMenuItemPrice
          setModalVisible={setShowAddPriceModal}
          modalVisible={showAddPriceModal}
          category={category.label}
          setPrices={setPrices}
          prices={prices}
          sizes={sizes}
        />
      )}
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <View style={styles.headerTop}>
        <BackButton />
        <View style={styles.headerActions}>
          {updateMode ? (
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => setUpdateMode(false)}
            >
              <Text style={styles.ghostLabel}>Annuler</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={activateUpdateMode}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryLabel}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error.length > 0 && <Text style={styles.errorBanner}>{error}</Text>}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          <View style={styles.generalRow}>
            {updateMode ? (
              <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <Image
                    source={{ uri: menuItem.image }}
                    style={styles.imagePreview}
                  />
                )}
              </TouchableOpacity>
            ) : (
              <Image
                source={{ uri: menuItem.image }}
                style={styles.imagePreview}
              />
            )}

            <View style={styles.infoColumn}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Nom</Text>
                {updateMode ? (
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(text) => setName(text)}
                    placeholder="Nom de l'article"
                    placeholderTextColor="#9CA3AF"
                  />
                ) : (
                  <Text style={styles.valueText}>{menuItem.name}</Text>
                )}
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.label}>Catégorie</Text>
                {updateMode ? (
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
                    placeholder="Catégorie"
                    value={category.value}
                    onChange={(item) => setCategory(item)}
                  />
                ) : (
                  <Text style={styles.valueText}>{menuItem.category.name}</Text>
                )}
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.label}>Description</Text>
                {updateMode ? (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                    placeholder="Décrivez l'article"
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                ) : (
                  <Text style={styles.valueText} numberOfLines={3}>
                    {menuItem.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personnalisations</Text>
          </View>
          <View style={{ gap: 10 }}>
            {updateMode && (
              <>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={toppingGroups
                    .filter(
                      (group) =>
                        !selectedToppingGroups.some(
                          (selectedGroup) => selectedGroup._id === group._id
                        )
                    )
                    .map((g) => ({
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
                      return [...prev, { _id: found._id, name: found.name }];
                    });
                  }}
                />
                {selectedToppingGroups.length > 0 && (
                  <View style={styles.customizationGrid}>
                    {selectedToppingGroups.map((group) => (
                      <View key={group._id} style={styles.custoPill}>
                        <Text style={styles.custoText}>{group.name}</Text>
                        <TouchableOpacity
                          style={styles.deleteIcon}
                          onPress={() =>
                            setSelectedToppingGroups((prev) =>
                              prev.filter(
                                (existingGroup) => existingGroup._id !== group._id
                              )
                            )
                          }
                        >
                          <AntDesign name="close" size={16} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {(!updateMode && menuItem.customization?.length > 0) ||
            (updateMode && customization?.length > 0) ? (
              <View style={styles.customizationGrid}>
                {(updateMode ? customization : menuItem.customization)?.map(
                  (custo, index) => (
                    <View key={custo._id || index} style={styles.custoBadge}>
                      <Text style={styles.custoText}>{custo.name}</Text>
                      {updateMode && (
                        <TouchableOpacity
                          style={styles.deleteIcon}
                          onPress={() => deleteFromCustomization(index)}
                        >
                          <AntDesign name="close" size={16} color="#6B7280" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ),
                )}
              </View>
            ) : null}

            {!updateMode &&
              (!Array.isArray(menuItem.customization_group)
                ? !menuItem.customization_group
                : menuItem.customization_group.length === 0) && (
              <Text style={styles.valueText}>Aucun groupe sélectionné</Text>
            )}
            {!updateMode &&
              (Array.isArray(menuItem.customization_group)
                ? menuItem.customization_group.length > 0
                : Boolean(menuItem.customization_group)) && (
              <Text style={styles.valueText}>
                Groupes :{" "}
                {(Array.isArray(menuItem.customization_group)
                  ? menuItem.customization_group
                  : [menuItem.customization_group]
                )
                  .map((group) => group?.name)
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prix</Text>
            {updateMode && (
              <TouchableOpacity
                style={[styles.primaryButton, { paddingHorizontal: 14 }]}
                onPress={() => setShowAddPriceModal(true)}
              >
                <Entypo name="plus" size={18} color="#1b1b1b" />
                <Text style={styles.primaryLabel}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.priceGrid}>
            {updateMode
              ? prices.map((item, index) => (
                  <View key={index} style={styles.pricePill}>
                    <Text style={styles.priceLabel}>{item.size}</Text>
                    <TextInput
                      value={item.price.toString()}
                      style={styles.priceInput}
                      keyboardType="decimal-pad"
                      onChangeText={(text) => updatePrice(text, index)}
                    />
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => deleteFromPrices(index)}
                    >
                      <AntDesign name="close" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))
              : menuItem.prices?.map((price) => (
                  <View key={price._id} style={styles.priceBadge}>
                    <Text style={styles.priceLabel}>{price.size}</Text>
                    <Text style={styles.priceValue}>
                      {price.price.toFixed(2)} $
                    </Text>
                  </View>
                ))}
          </View>
        </View>

        {updateMode && (
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.saveButton]}
              onPress={() => saveUpdates()}
            >
              <Text style={styles.primaryLabel}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ItemScreen;

const styles = StyleSheet.create({
  headerTop: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.screenBg,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "rgba(225,79,79,0.12)",
    borderColor: "rgba(225,79,79,0.4)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: Colors.danger,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
  },
  scroll: { flex: 1, backgroundColor: Colors.screenBg, marginTop: 20 },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 20,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#111827",
  },
  generalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  imageUpload: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.gry,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
  infoColumn: {
    flex: 1,
    gap: 12,
    minWidth: 260,
  },
  fieldRow: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#111827",
  },
  valueText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    backgroundColor: Colors.gry,
    color: "#111827",
  },
  textArea: {
    minHeight: 90,
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
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pricePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.gry,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.gry,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#111827",
    textTransform: "capitalize",
  },
  priceValue: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1f2937",
  },
  priceInput: {
    width: 90,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "white",
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
  },
  deleteIcon: {
    padding: 4,
  },
  customizationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  custoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.gry,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  custoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.gry,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  custoText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#111827",
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  ghostButton: {
    backgroundColor: Colors.gry,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1f2937",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
