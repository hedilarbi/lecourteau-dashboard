import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Colors, Fonts } from "../../constants";
import * as ImagePicker from "expo-image-picker";
import { createMenuItemsCategory } from "../../services/MenuItemServices";
import SuccessModel from "./SuccessModel";
const CreateCategoryModel = ({ setShowCreateCategoryModel }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const saveItem = async () => {
    setIsLoading(true);
    createMenuItemsCategory(name)
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
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

        setShowCreateCategoryModel(false);
      }, 1000);

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

    console.log(result);

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
        <View>
          <View style={styles.image}>
            <Text style={styles.text}>Image</Text>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
                marginLeft: 20,
                borderRadius: 5,
              }}
              onPress={() => pickImage()}
            >
              <Text style={styles.text}>Upload Image</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.name}>
            <Text style={styles.text}>Name</Text>
            <TextInput
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 18,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5,
                paddingTop: 5,
                borderWidth: 1,
                borderRadius: 5,
                marginLeft: 20,
              }}
              placeholder="Item Name"
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
          <Text style={styles.text}>Save</Text>
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
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 22,
  },
  name: {
    flexDirection: "row",
    marginTop: 40,
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
