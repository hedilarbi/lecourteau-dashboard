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

import { API_URL } from "@env";
import mime from "mime";
const UpdateCategoryModal = ({
  setShowUpdateCategorygModal,
  category,
  setRefresh,
}) => {
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setRefresh((prev) => prev + 1);

        setShowUpdateCategorygModal(false);
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
      formdata.append("fileToDelete", category.image);
    }

    formdata.append("name", name.length > 0 ? name : category.name);

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/categories/update/${category._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
            "cache-control": "no-cache",
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
          <TouchableOpacity onPress={() => setShowUpdateCategorygModal(false)}>
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
        <View
          style={{ flexDirection: "row", marginTop: 20, alignItems: "center" }}
        >
          <TouchableOpacity
            onPress={pickImage}
            style={{ width: 150, height: 150, backgroundColor: Colors.mgry }}
          >
            <Image
              source={{ uri: image || category.image }}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
          <View style={{ marginLeft: 20, flex: 1 }}>
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
                placeholder={category.name}
                onChangeText={(text) => setName(text)}
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

export default UpdateCategoryModal;
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
