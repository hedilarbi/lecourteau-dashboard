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
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { createMenuItem, getCategories } from "../../services/MenuItemServices";
import { getToppings } from "../../services/ToppingsServices";
import AddCategoryModel from "./AddToppingModel";
import * as ImagePicker from "expo-image-picker";
import AddToppingModel from "./AddToppingModel";
import SuccessModel from "./SuccessModel";

const CreateItemModel = ({ setShowCreateItemModel, setMenuItems }) => {
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [customizationsNames, setCustomizationsNames] = useState([]);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [categoryName, setCategoryName] = useState("Entreé");
  const [description, setDescription] = useState("");
  const [prices, setPrices] = useState([
    { size: "Petite", price: 0 },
    { size: "Moyenne", price: 0 },
    { size: "Large", price: 0 },
    { size: "Familliale", price: 0 },
  ]);

  const fetchData = async () => {
    try {
      const [categoriesResponse, toppingResponse] = await Promise.all([
        getCategories(),
        getToppings(),
      ]);

      if (categoriesResponse?.status) {
        setCategories(categoriesResponse?.data);
        categoriesResponse?.data.map((item) =>
          categoriesNames.push({ value: item.name, label: item.name })
        );
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
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
    let category = "";
    categories.map((item) => {
      if (item.name === categoryName) {
        category = item._id;
      }
    });
    const customization = customizationsNames.map((item) => {
      return item._id;
    });
    setIsloading(true);
    createMenuItem(name, prices, customization, category, description).then(
      (response) => {
        if (response?.status) {
          setShowSuccessModel(true);
          setMenuItems((prev) => [...prev, response.data]);
        } else {
          console.log(response.message);
        }
      }
    );

    setIsloading(false);
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setShowCreateItemModel(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
  const handlePriceChange = (index, newPrice) => {
    const updatedPrices = [...prices]; // Create a copy of the prices array
    updatedPrices[index].price = newPrice; // Update the price of the specific index
    setPrices(updatedPrices); // Set the state with the updated array
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
      {showAddCategoryModel && (
        <AddToppingModel
          setShowAddCategoryModel={setShowAddCategoryModel}
          toppings={toppings}
          setCustomizationsNames={setCustomizationsNames}
        />
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
            Add Menu Item
          </Text>
          <TouchableOpacity
            style={{ alignSelf: "flex-end" }}
            onPress={() => setShowCreateItemModel(false)}
          >
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
        </View>

        <View>
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
              <Text style={styles.text}>Description</Text>
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
                placeholder="Description"
                placeholderTextColor={Colors.tgry}
                onChangeText={(text) => setDescription(text)}
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
                value={categoryName}
                onChange={(item) => {
                  setCategoryName(item.label);
                }}
              />
            </View>
            <View style={styles.prices}>
              <Text style={styles.text}>Prices</Text>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {prices.map((item, index) => (
                  <View style={styles.priceBox} key={index}>
                    <Text style={styles.text}>{item.size[0]}</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="13.25"
                      keyboardType="numeric"
                      onChangeText={(text) => handlePriceChange(index, text)}
                    />
                    <Text style={styles.text}>$</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.customizations}>
              <Text style={styles.text}>Customizations</Text>
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

                    <View style={{ alignSelf: "flex-end", marginLeft: 10 }}>
                      <AntDesign name="close" size={24} color="gray" />
                    </View>
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
                  <Text style={styles.text}>Add</Text>
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
            <Text style={styles.text}>Save</Text>
          </TouchableOpacity>
        </View>
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
