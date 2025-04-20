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
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import { getCategories } from "../../services/MenuItemServices";
import { getToppings } from "../../services/ToppingsServices";
import { API_URL } from "@env";
import * as ImagePicker from "expo-image-picker";
import AddToppingModel from "./AddToppingModel";
import SuccessModel from "./SuccessModel";

import mime from "mime";
import AddMenuItemPrice from "./AddMenuItemPrice";
import FailModel from "./FailModel";
import { getSizes } from "../../services/SizesServices";

const CreateItemModel = ({ setShowCreateItemModel, setRefresh }) => {
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [customizationsNames, setCustomizationsNames] = useState([]);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [name, setName] = useState("");
  const [showFailModal, setShowFailModal] = useState(false);
  const [image, setImage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [categoriesResponse, toppingResponse, sizeResponse] =
        await Promise.all([getCategories(), getToppings(), getSizes()]);

      if (categoriesResponse?.status) {
        setCategories(categoriesResponse?.data);
        categoriesResponse?.data.map((item) =>
          categoriesNames.push({ value: item.name, label: item.name })
        );
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
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
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveItem = async () => {
    if (image.length < 1) {
      setError("Image de l'article manquante");
      return;
    }
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
    if (categoriesNames.length < 1) {
      setError("Catégorie de l'article manquante");
      return;
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
    const formdata = new FormData();
    if (image) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
    }
    formdata.append("customization", JSON.stringify(customization));
    formdata.append("prices", JSON.stringify(prices));
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
      console.error("Error saving item:", err);
      setMessage(err.message);
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
  const deletePrice = (index) => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setPrices(newPrices);
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
    <View style={styles.container}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && <FailModel message={message} />}
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
      <AddMenuItemPrice
        setModalVisible={setShowAddPriceModal}
        modalVisible={showAddPriceModal}
        category={categoryName}
        setPrices={setPrices}
        prices={prices}
        sizes={sizes}
      />
      <View style={styles.model}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Ajouter un article
          </Text>
          <TouchableOpacity
            style={{ alignSelf: "flex-end" }}
            onPress={() => setShowCreateItemModel(false)}
          >
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {error.length > 0 && (
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 20,
                textAlign: "center",
                color: "red",
              }}
            >
              {error}
            </Text>
          )}

          <View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 16,
                    backgroundColor: "gray",
                    marginTop: 20,
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
                    <Entypo name="camera" size={48} color="black" />
                  )}
                </TouchableOpacity>
                <View
                  style={{ marginLeft: 40, justifyContent: "space-between" }}
                >
                  <View style={styles.name}>
                    <Text style={styles.text}>Nom</Text>
                    <TextInput
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        paddingHorizontal: 5,
                        paddingVertical: 8,
                        width: "50%",
                        borderWidth: 2,

                        borderColor: Colors.primary,
                        marginLeft: 20,
                      }}
                      placeholder="Item Name"
                      onChangeText={(text) => setName(text)}
                    />
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.text}>Description</Text>
                    <TextInput
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        paddingHorizontal: 5,
                        paddingVertical: 8,
                        flex: 1,
                        borderWidth: 2,

                        borderColor: Colors.primary,
                        marginLeft: 20,
                      }}
                      placeholder="Description"
                      onChangeText={(text) => setDescription(text)}
                    />
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.text}>Categorie</Text>
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
                      value={categoryName}
                      onChange={(item) => {
                        setCategoryName(item.label);
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.customizations}>
                <Text style={styles.text}>Prix</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 20,
                    marginTop: 20,
                  }}
                >
                  {prices.map((price, index) => (
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "white",
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        marginTop: 10,
                      }}
                      key={index}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.LATO_BOLD,
                          fontSize: 16,
                          textTransform: "capitalize",
                        }}
                      >
                        {price.size}
                      </Text>
                      <Text
                        style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 16 }}
                      >
                        {price.price} $
                      </Text>
                      <TouchableOpacity
                        style={{ alignSelf: "flex-end", marginLeft: 10 }}
                        onPress={() => deletePrice(index)}
                      >
                        <AntDesign name="close" size={24} color="gray" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={{
                      backgroundColor: Colors.primary,
                      paddingHorizontal: 40,
                      paddingVertical: 10,
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                      marginTop: 10,
                      borderRadius: 5,
                    }}
                    onPress={() => setShowAddPriceModal(true)}
                  >
                    <Entypo name="plus" size={24} color="black" />
                    <Text style={styles.text}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.customizations}>
                <Text style={styles.text}>Personalisations</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 20,
                    marginTop: 20,
                  }}
                >
                  {customizationsNames.map((customization, index) => (
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        backgroundColor: "white",
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        marginTop: 10,
                      }}
                      key={index}
                    >
                      <Text style={styles.text}>{customization.name}</Text>

                      <TouchableOpacity
                        style={{ alignSelf: "flex-end", marginLeft: 10 }}
                        onPress={() => deleteCustomization(index)}
                      >
                        <AntDesign name="close" size={24} color="gray" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={{
                      backgroundColor: Colors.primary,
                      paddingHorizontal: 40,
                      paddingVertical: 10,
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                      marginTop: 10,
                      borderRadius: 5,
                    }}
                    onPress={() => setShowAddCategoryModel(true)}
                  >
                    <Entypo name="plus" size={24} color="black" />
                    <Text style={styles.text}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={{
                marginTop: 40,
                alignSelf: "flex-end",
                backgroundColor: Colors.primary,
                paddingHorizontal: 60,
                paddingVertical: 10,
                borderRadius: 5,
              }}
              onPress={saveItem}
            >
              <Text style={styles.text}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
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
    zIndex: 100,
  },
  model: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "90%",
    height: "90%",
  },
  image: { flexDirection: "row", marginTop: 40, alignItems: "center" },
  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  name: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },

  dropdown: {
    height: 40,
    width: 300,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,

    marginLeft: 20,
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
  priceBox: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginTop: 20,
  },
  prices: { marginTop: 40 },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
  },
  customizations: {
    marginTop: 40,
  },
});
