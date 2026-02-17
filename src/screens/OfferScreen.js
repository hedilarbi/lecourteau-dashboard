import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getOffer, updateOffer } from "../services/OffersServices";
import { Colors, Fonts } from "../constants";
import { useRoute } from "@react-navigation/native";
import { convertDateToDate } from "../utils/dateHandlers";
import { getItemsNames } from "../services/MenuItemServices";
import { getToppings } from "../services/ToppingsServices";
import Calender from "../components/Calender";
import { AntDesign, Entypo } from "@expo/vector-icons";
import AddItemModel from "../components/models/AddItemMode";
import AddToppingModel from "../components/models/AddToppingModel";
import SuccessModel from "../components/models/SuccessModel";
import * as ImagePicker from "expo-image-picker";
import FailModel from "../components/models/FailModel";
import mime from "mime";
import { API_URL } from "@env";
const OfferScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [offer, setOffer] = useState({});
  const [updateMode, setUpdateMode] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [items, setItems] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [image, setImage] = useState("");
  const [showAddItemModel, setShowAddItemModel] = useState(false);
  const [showAddToppingModel, setShowAddToppingModel] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [customizationsList, setCustomizationsList] = useState([]);
  const [showFailModal, setShowFailModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    getOffer(id)
      .then((response) => {
        if (response.status) {
          setOffer(response.data);
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
      }, 1000);

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
  const deleteFromItems = (index) => {
    const updatedList = items.filter((item, i) => i !== index);
    setItems(updatedList);
  };

  const deleteFromCustomizations = (index) => {
    const updatedList = customizations.filter((item, i) => i !== index);
    setCustomizations(updatedList);
  };

  const activateUpdateMode = async () => {
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
        setShowFailModal(true);
      }
      if (toppingResponse.status) {
        setCustomizationsList(toppingResponse.data);
      } else {
        setShowFailModal(true);
      }
    } catch (err) {
      setShowFailModal(true);
    } finally {
      const date = new Date(offer.expireAt);
      setName(offer.name);
      setPrice(offer.price);
      setExpireAt(date);

      setCustomizations(offer.customizations);
      setItems(offer.items);
      setUpdateMode(true);
      setIsLoading(false);
    }
  };
  const saveUpdates = async () => {
    setIsLoading(true);
    // updateOffer(
    //   id,

    //   name,
    //   price,
    //   expireAt,

    //   items,
    //   customizations
    // )
    //   .then((response) => {
    //     if (response.status) {
    //       setShowSuccessModel(true);
    //       setOffer(response.data);
    //     } else {
    //       setShowFailModal(true);
    //     }
    //   })
    //   .finally(() => {
    //     setIsLoading(false);
    //   });

    const formdata = new FormData();
    if (image.length > 0) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
      formdata.append("fileToDelete", offer.image);
    }
    formdata.append("expireAt", expireAt.toString());

    formdata.append("name", name);
    formdata.append("price", price);

    formdata.append("customizations", JSON.stringify(customizations));
    formdata.append("items", JSON.stringify(items));

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/offers/update/${id}`, {
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
      setOffer(data);
      setShowSuccessModel(true);
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
    <View style={styles.screen}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      {showAddItemModel && (
        <AddItemModel
          setShowAddItemModel={setShowAddItemModel}
          setItems={setItems}
          menuItems={menuItems}
        />
      )}
      {showAddToppingModel && (
        <AddToppingModel
          customizationsNames={customizations}
          setShowAddCategoryModel={setShowAddToppingModel}
          setCustomizationsNames={setCustomizations}
          toppings={customizationsList}
        />
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Informations</Text>
              <Text style={styles.subtitle}>
                Consultez et modifiez les détails de l'offre.
              </Text>
            </View>
            {updateMode ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setUpdateMode(false)}
              >
                <Text style={styles.actionLabel}>Annuler</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={activateUpdateMode}
              >
                <Text style={styles.actionLabel}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.topRow}>
            <View style={styles.imageColumn}>
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={pickImage}
                activeOpacity={0.85}
                disabled={!updateMode}
              >
                {image || offer.image ? (
                  <Image
                    source={{ uri: image || offer.image }}
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
                {updateMode ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Nom de l'offre"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={(text) => setName(text)}
                  />
                ) : (
                  <Text style={styles.valueText}>{offer.name}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Prix</Text>
                {updateMode ? (
                  <View style={styles.priceRow}>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={price?.toString() ?? ""}
                      onChangeText={(text) => setPrice(text)}
                      keyboardType="numeric"
                      placeholder="Prix"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.priceSuffix}>$</Text>
                  </View>
                ) : (
                  <Text style={styles.valueText}>
                    {offer.price ? `${offer.price.toFixed(2)} $` : "--"}
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Date d'expiration</Text>
                {updateMode ? (
                  <Calender setDate={setExpireAt} date={expireAt} />
                ) : (
                  <Text style={styles.valueText}>
                    {offer.expireAt ? convertDateToDate(offer.expireAt) : "--"}
                  </Text>
                )}
              </View>

              <View style={[styles.card, styles.inlineCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Articles</Text>
                </View>
                <View style={styles.pillList}>
                  {(updateMode ? items : offer.items || []).map(
                    (entry, index) => (
                      <View style={styles.pill} key={index}>
                        <Text style={styles.pillText}>
                          {entry?.item?.name || entry?.name || "--"} x{" "}
                          {entry?.quantity ?? "--"}
                        </Text>
                        {updateMode && (
                          <TouchableOpacity
                            style={styles.pillAction}
                            onPress={() => deleteFromItems(index)}
                          >
                            <AntDesign name="close" size={16} color="#6B7280" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ),
                  )}
                  {updateMode && (
                    <TouchableOpacity
                      style={styles.addPill}
                      onPress={() => setShowAddItemModel(true)}
                    >
                      <Entypo name="plus" size={18} color="#1b1b1b" />
                      <Text style={styles.addPillText}>Ajouter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {updateMode && (
          <View style={styles.saveRow}>
            <TouchableOpacity style={styles.saveButton} onPress={saveUpdates}>
              <Text style={styles.saveLabel}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OfferScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 24,
  },
  actionButton: {
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.gry,
  },
  actionLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  section: {
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
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
    fontSize: 22,
    color: "#111827",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
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
  valueText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
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
  inlineCard: {
    width: "100%",
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
  saveRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  saveLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
});
