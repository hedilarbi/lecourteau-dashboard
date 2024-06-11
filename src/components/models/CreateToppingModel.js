import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { ApiUrl, Colors, Fonts } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import { getToppingsCategories } from "../../services/ToppingsServices";
import SuccessModel from "./SuccessModel";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import { API_URL } from "@env";
import FailModel from "./FailModel";

const CreateToppingModel = ({
  setShowCreateToppingModel,

  setRefresh,
}) => {
  const [category, setCategory] = useState({});

  const [isLoading, setIsloading] = useState(true);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [showFailModal, setShowFailModal] = useState(false);
  const fetchData = async () => {
    getToppingsCategories().then((response) => {
      if (response.status) {
        let list = [];
        response?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setCategoriesNames(list);
      }
    });
    setIsloading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const saveItem = async () => {
    if (name.length < 1) {
      setError("Nom de la personalisation manquant");
      return;
    }
    if (image.length < 1) {
      setError("Image de la personalisation manquante");
      return;
    }
    if (Object.keys(category).length < 1) {
      setError("Catégorie de la personalisation manquante");
      return;
    }
    if (price.length < 1) {
      setError("Prix de la personalisation manquant");
      return;
    }
    const formdata = new FormData();
    console.log(image);
    if (image) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
    }

    formdata.append("name", name);
    formdata.append("category", category.id);
    formdata.append("price", price);

    try {
      setIsloading(true);
      const response = await fetch(`${API_URL}/toppings/create`, {
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
      setIsloading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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
        setRefresh((prev) => prev + 1);
        setShowSuccessModel(false);
        setShowCreateToppingModel(false);
      }, 2000);

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

  return (
    <View style={styles.container}>
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
            Ajouter une Personnalisation
          </Text>
          <TouchableOpacity onPress={() => setShowCreateToppingModel(false)}>
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
        <View style={{ flexDirection: "row", marginTop: 40 }}>
          <TouchableOpacity
            style={{
              width: 150,
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
              <Entypo name="camera" size={38} color="black" />
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 40, justifyContent: "space-between" }}>
            <View style={styles.name}>
              <Text style={styles.text}>Nom</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingBottom: 5,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  marginLeft: 20,
                  flex: 1,
                }}
                placeholder="Nom"
                placeholderTextColor={Colors.tgry}
                onChangeText={(text) => setName(text)}
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
                value={category.name}
                onChange={(item) => {
                  setCategory({ id: item.value, name: item.label });
                }}
              />
            </View>
            <View style={styles.prices}>
              <Text style={styles.text}>Prix</Text>

              <View style={styles.priceBox}>
                <TextInput
                  style={styles.priceInput}
                  onChangeText={(text) => setPrice(text)}
                  keyboardType="numeric"
                  placeholder="Prix"
                />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  marginLeft: 10,
                }}
              >
                $
              </Text>
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

export default CreateToppingModel;

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
    width: "70%",
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

  dropdown: {
    height: 40,
    width: 200,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
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
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },

  prices: { flexDirection: "row", alignItems: "center" },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    padding: 6,
    marginLeft: 20,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});
