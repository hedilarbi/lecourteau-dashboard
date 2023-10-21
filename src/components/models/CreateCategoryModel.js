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
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Colors, Fonts } from "../../constants";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@env";
import SuccessModel from "./SuccessModel";
import mime from "mime";
const CreateCategoryModel = ({ setShowCreateCategoryModel }) => {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const saveItem = async () => {
    if (name.length < 1) {
      setError("Nom de la catégorie manquant");
      return;
    }
    if (image.length < 1) {
      setError("Image de la catégorie manquante");
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

    formdata.append("name", name);

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories/create`, {
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
      setShowCreateCategoryModel(false);
    } catch (err) {
      if (err.response) {
        Alert.alert(err.response.message);
        Alert.alert("hy");
      } else {
        Alert.alert(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setShowCreateCategoryModel(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
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

  return (
    <View style={styles.container}>
      {showSuccessModel && <SuccessModel />}
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
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowCreateCategoryModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{
              width: 100,
              height: 100,
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
              <Entypo name="camera" size={26} color="black" />
            )}
          </TouchableOpacity>
          <View style={[styles.name, { marginLeft: 20 }]}>
            <Text style={styles.text}>Nom</Text>
            <TextInput
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 20,
                paddingHorizontal: 5,
                paddingVertical: 8,
                width: "70%",
                borderWidth: 2,

                borderColor: Colors.primary,
                marginLeft: 20,
              }}
              placeholder="Nom de la catégorie"
              placeholderTextColor={Colors.tgry}
              onChangeText={(text) => setName(text)}
            />
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

export default CreateCategoryModel;

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
    height: 30,
    width: 200,
    borderColor: "gray",
    borderWidth: 0.5,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginLeft: 40,
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
