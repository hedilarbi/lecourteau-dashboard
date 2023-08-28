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
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import {
  createTopping,
  getToppingsCategories,
} from "../../services/ToppingsServices";
import SuccessModel from "./SuccessModel";

const CreateToppingModel = ({
  setShowCreateToppingModel,

  setRefresh,
}) => {
  const [category, setCategory] = useState({
    name: "",
    id: "",
  });

  const [isLoading, setIsloading] = useState(true);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [price, setPrice] = useState(0);
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
    setIsloading(true);
    createTopping(name, category.id, price).then((response) => {
      if (response.status) {
        setShowSuccessModel(true);
      } else {
        console.log(response);
      }
    });
    setIsloading(false);
  };

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
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setShowCreateToppingModel(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);

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
          onPress={() => setShowCreateToppingModel(false)}
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
              onPress={pickImage}
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
          <View style={styles.name}>
            <Text style={styles.text}>Category</Text>
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
              placeholder={""}
              value={category.name}
              onChange={(item) => {
                setCategory({ id: item.value, name: item.label });
              }}
            />
          </View>
          <View style={styles.prices}>
            <Text style={styles.text}>Price</Text>

            <View style={styles.priceBox}>
              <TextInput
                style={styles.priceInput}
                onChangeText={(text) => setPrice(text)}
                keyboardType="numeric"
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
          onPress={saveItem}
        >
          <Text style={styles.text}>Save</Text>
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
    marginLeft: 40,
  },
  prices: { marginTop: 40, flexDirection: "row", alignItems: "center" },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 40,
  },
});
