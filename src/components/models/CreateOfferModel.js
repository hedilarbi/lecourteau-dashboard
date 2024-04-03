import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
        console.log(itemsNamesResponse);
      }
      if (toppingResponse.status) {
        setCustomizationsList(toppingResponse.data);
      } else {
        console.log(toppingResponse);
      }
    } catch (err) {
      console.log(err);
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
    formdata.append("expireAt", date.toLocaleDateString());

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
      setRefresh((prev) => prev + 1);
      setShowSuccessModel(true);
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);

        setShowCreateOfferModel(false);
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
    <View style={styles.container}>
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
      <View style={styles.model}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Ajouter une offre
          </Text>
          <TouchableOpacity onPress={() => setShowCreateOfferModel(false)}>
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
        </View>
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
        <View style={{ marginTop: 40 }}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{
                width: 250,
                height: 150,
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
                <Entypo name="camera" size={48} color="black" />
              )}
            </TouchableOpacity>
            <View
              style={{
                marginLeft: 20,
                justifyContent: "space-between",
              }}
            >
              <View style={styles.name}>
                <Text style={styles.text}>Nom</Text>
                <TextInput
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    padding: 5,
                    borderWidth: 2,
                    borderColor: Colors.primary,
                    marginLeft: 20,
                    flex: 1,
                  }}
                  placeholder="Nom de l'offre"
                  placeholderTextColor={Colors.tgry}
                  onChangeText={(text) => setName(text)}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.text}>Prix</Text>

                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: Colors.primary,
                    padding: 5,
                    paddingHorizontal: 8,
                    marginHorizontal: 10,
                  }}
                  onChangeText={(text) => setPrice(text)}
                  keyboardType="numeric"
                  placeholder="prix"
                />
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  $
                </Text>
              </View>
              <View style={styles.prices}>
                <Text style={styles.text}>Date d'éxpiration</Text>

                <Calender setDate={setDate} date={date} />
              </View>
            </View>
          </View>

          <View style={styles.customizations}>
            <Text style={styles.text}>Articles</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 20,
                marginTop: 20,
              }}
            >
              {items.map((item, index) => (
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.text}>{item.item.name}</Text>
                    <Text style={styles.text}> x {item.quantity}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ alignSelf: "flex-end", marginLeft: 10 }}
                    onPress={() => deleteItem(index)}
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
                onPress={() => setShowAddItemModel(true)}
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
              {customizationsNames.map((item, index) => (
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.text}>{item.name}</Text>
                  </View>
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
    </View>
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
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "80%",
  },
  image: { flexDirection: "row", marginTop: 40, alignItems: "center" },
  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  name: {
    flexDirection: "row",

    alignItems: "center",
  },

  priceBox: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  prices: { flexDirection: "row", alignItems: "center" },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,

    borderRadius: 5,
    marginLeft: 10,
  },
  customizations: {
    marginTop: 40,
  },
});
