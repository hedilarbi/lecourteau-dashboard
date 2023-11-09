import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Colors, Fonts } from "../../constants";
import * as ImagePicker from "expo-image-picker";
import SuccessModel from "./SuccessModel";
import FailModel from "./FailModel";
import { getToppingsCategories } from "../../services/ToppingsServices";
import { Dropdown } from "react-native-element-dropdown";
import { API_URL } from "@env";
import mime from "mime";
const UpdateToppingModal = ({
  setShowUpdateToppingModal,
  topping,
  setRefresh,
}) => {
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [price, setPrice] = useState("");
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [category, setCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setRefresh((prev) => prev + 1);

        setShowUpdateToppingModal(false);
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
    setIsLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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

  const saveChanges = async () => {
    const formdata = new FormData();
    if (image) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
      formdata.append("fileToDelete", topping.image);
    }

    formdata.append("name", name.length > 0 ? name : topping.name);
    formdata.append("price", price.length > 0 ? price : topping.price);
    formdata.append(
      "category",
      Object.keys(category).length > 0 ? category._id : topping.category._id
    );
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/toppings/update/${topping._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formdata,
        }
      );
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();

      setShowSuccessModel(true);
    } catch (err) {
      console.log(err.message);
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        backgroundColor: "rgba(50,44,44,0.4)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
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
      <View style={styles.model}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Modifier une personalisation
          </Text>
          <TouchableOpacity onPress={() => setShowUpdateToppingModal(false)}>
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
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
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity
            onPress={pickImage}
            style={{ width: 150, height: 150, backgroundColor: Colors.mgry }}
          >
            <Image
              source={{ uri: image || topping.image }}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
          <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
            <View style={styles.name}>
              <Text style={styles.text}>Nom</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  marginLeft: 20,
                  flex: 1,
                }}
                placeholder={topping.name}
                onChangeText={(text) => setName(text)}
              />
            </View>

            <View style={styles.name}>
              <Text style={styles.text}>Prix</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  marginLeft: 20,
                  flex: 1,
                }}
                placeholder={topping.price.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setPrice(text)}
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
          onPress={saveChanges}
        >
          <Text style={styles.text}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpdateToppingModal;
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
