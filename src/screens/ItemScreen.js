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
import SuccessModel from "../components/models/SuccessModel";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@env";
import mime from "mime";
import FailModel from "../components/models/FailModel";
import AddMenuItemPrice from "../components/models/AddMenuItemPrice";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getSizes } from "../services/SizesServices";
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
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);

  const fetchData = async () => {
    getMenuItem(id)
      .then((response) => {
        if (response.status) {
          setMenuItem(response.data);
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
    try {
      const [categoriesResponse, toppingResponse, sizeResponse] =
        await Promise.all([getCategories(), getToppings(), getSizes()]);

      if (categoriesResponse?.status) {
        categoriesResponse?.data.map((item) =>
          categoriesNames.push({ value: item._id, label: item.name })
        );
      } else {
        setShowFailModal(true);
      }
      if (sizeResponse?.status) {
        setSizes(
          sizeResponse?.data.map((size) => ({
            label: size.name,
            value: size.name,
          }))
        );
      }
      if (toppingResponse?.status) {
        setToppings(toppingResponse?.data);
      } else {
        console.error("topping data not found:", toppingResponse.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setName(menuItem.name);
      setDescription(menuItem.description || "");
      setCategory({
        label: menuItem.category.name,
        value: menuItem.category._id,
      });
      setPrices(menuItem.prices);
      setCustomization(menuItem.customization);
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
    formdata.append("prices", JSON.stringify(prices));
    formdata.append("name", name);
    formdata.append("category", category.value);
    formdata.append("description", description);
    setIsLoading(true);
    setError("");
    try {
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
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.screenBg }}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
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
              backgroundColor: "white",
              borderRadius: 10,
              padding: 16,
              flexDirection: "row",
              marginTop: 20,
            }}
          >
            {updateMode ? (
              <TouchableOpacity
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 16,
                  backgroundColor: "gray",

                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={pickImage}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      resizeMode: "cover",
                      width: "100%",
                      height: "100%",
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <Image
                    source={{ uri: menuItem.image }}
                    style={{
                      width: 200,
                      height: 200,
                      resizeMode: "cover",
                      borderRadius: 10,
                    }}
                  />
                )}
              </TouchableOpacity>
            ) : (
              <Image
                source={{ uri: menuItem.image }}
                style={{
                  width: 200,
                  height: 200,
                  resizeMode: "cover",
                  borderRadius: 10,
                }}
              />
            )}

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
                    value={name}
                    onChangeText={(text) => setName(text)}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    {menuItem.name}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Categorie:
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
                    data={categoriesNames}
                    maxHeight={300}
                    labelField="label"
                    valueField="label"
                    placeholder="Catégorie"
                    value={category.label}
                    onChange={(item) => setCategory(item)}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    {menuItem.category.name}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Description:
                </Text>
                {updateMode ? (
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: Colors.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                      width: "70%",
                    }}
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                      width: "70%",
                    }}
                    numberOfLines={2}
                  >
                    {menuItem.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Prix
          </Text>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 16,
              marginTop: 10,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 40,
            }}
          >
            {updateMode ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 40,
                  flex: 1,
                }}
              >
                {prices.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 5,
                      paddingVertical: 0,
                      paddingHorizontal: 10,
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                      {item.size}:
                    </Text>
                    <TextInput
                      value={item.price.toString()}
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 5,
                        marginVertical: 10,
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                        marginLeft: 10,
                        backgroundColor: "black",
                        color: Colors.primary,
                      }}
                      keyboardType="numeric"
                      onChangeText={(text) => updatePrice(text, index)}
                    />
                    <TouchableOpacity
                      style={{ marginLeft: 5 }}
                      onPress={() => deleteFromPrices(index)}
                    >
                      <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                  onPress={() => setShowAddPriceModal(true)}
                >
                  <Entypo name="plus" size={24} color="black" />
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_BOLD,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    Ajouter
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 40,
                  flex: 1,
                }}
              >
                {menuItem.prices?.map((price) => (
                  <View
                    key={price._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                      {price.size}:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {price.price.toFixed(2)} $
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Personalisations
          </Text>
          {updateMode ? (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                padding: 16,
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              {customization?.map((custo, index) => (
                <View
                  key={custo._id}
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                  >
                    {custo.name}
                  </Text>

                  <TouchableOpacity
                    style={{ marginLeft: 5 }}
                    onPress={() => deleteFromCustomization(index)}
                  >
                    <AntDesign name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  flexDirection: "row",
                }}
                onPress={() => setShowAddCustomizationModel(true)}
              >
                <Entypo name="plus" size={24} color="black" />
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  Ajouter
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                padding: 16,
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
              }}
            >
              {menuItem.customization?.length > 0 ? (
                menuItem.customization?.map((custo, index) => (
                  <View
                    key={custo._id}
                    style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 5,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {custo.name}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 20 }}>
                  Aucune personalisation
                </Text>
              )}
            </View>
          )}
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
                marginBottom: 20,
              }}
              onPress={() => saveUpdates()}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Sauvegarder
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ItemScreen;

const styles = StyleSheet.create({
  dropdown: {
    height: 40,

    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    width: "30%",
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
