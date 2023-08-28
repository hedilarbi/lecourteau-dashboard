import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors, Fonts } from "../constants";
import {
  getCategories,
  getMenuItem,
  updateMenuItem,
} from "../services/MenuItemServices";
import { useRoute } from "@react-navigation/native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Dropdown } from "react-native-element-dropdown";
import AddToppingModel from "../components/models/AddToppingModel";
import { getToppings } from "../services/ToppingsServices";
import SuccessModel from "../components/models/SuccessModel";
const ItemScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [menuItem, setMenuItem] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [updateMode, setUpdateMode] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [customization, setCustomization] = useState([]);
  const [prices, setPrices] = useState([]);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [showAddCustomizationModel, setShowAddCustomizationModel] =
    useState(false);
  const [toppings, setToppings] = useState([]);
  const [showSuccessModel, setShowSuccessModel] = useState(false);

  const fetchData = async () => {
    getMenuItem(id)
      .then((response) => {
        if (response.status) {
          setMenuItem(response.data);
        } else {
          console.log(response);
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

        setUpdateMode(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);

  useEffect(() => {
    fetchData();
  }, []);
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

  const activateUpdateMode = async () => {
    setIsLoading(true);
    try {
      const [categoriesResponse, toppingResponse] = await Promise.all([
        getCategories(),
        getToppings(),
      ]);

      if (categoriesResponse?.status) {
        categoriesResponse?.data.map((item) =>
          categoriesNames.push({ value: item._id, label: item.name })
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
      setName(menuItem.name);
      setDescription(menuItem.description);
      setCategory({
        labe: menuItem.category.name,
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

  const saveUpdates = async () => {
    setIsLoading(true);
    updateMenuItem(
      id,
      menuItem.image,
      name,
      description,
      category,

      prices,
      customization
    )
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
          setMenuItem(response.data);
        } else {
          console.log(response);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: Colors.screenBg }}>
        {showAddCustomizationModel && (
          <AddToppingModel
            setShowAddCategoryModel={setShowAddCustomizationModel}
            setCustomizationsNames={setCustomization}
            toppings={toppings}
          />
        )}
        {showSuccessModel && <SuccessModel />}
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
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                Cancle
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
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                Update
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 28 }}>
            General Info
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
            <Image
              source={{ uri: menuItem.image }}
              style={{
                width: 200,
                height: 200,
                resizeMode: "cover",
                borderRadius: 10,
              }}
            />
            <View style={{ marginLeft: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                  Name:
                </Text>
                {updateMode ? (
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderRadius: 5,
                      paddingHorizontal: 5,
                      marginVertical: 10,
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
                      fontSize: 24,
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
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                  Category:
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
                    placeholder={""}
                    value={category.label}
                    onChange={(item) => setCategory(item)}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 24,
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

                  marginTop: 10,
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                  Description:
                </Text>
                {updateMode ? (
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderRadius: 5,
                      paddingHorizontal: 5,
                      marginVertical: 10,
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
                      fontSize: 24,
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
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 28 }}>
            Prices
          </Text>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 16,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {updateMode ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                {prices.map((item, index) => (
                  <View
                    key={item._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                      {item.size}:
                    </Text>
                    <TextInput
                      value={item.price.toString()}
                      style={{
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 5,
                        marginVertical: 10,
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                        width: 70,
                      }}
                      keyboardType="numeric"
                      onChangeText={(text) => updatePrice(text, index)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                    <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                      {price.size}:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 24,
                        marginLeft: 10,
                      }}
                    >
                      {price.price} $
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 28 }}>
            Customizations
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
                      fontSize: 24,
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
                }}
                onPress={() => setShowAddCustomizationModel(true)}
              >
                <FontAwesome name="plus" size={24} color="black" />
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
              {menuItem.customization?.map((custo, index) => (
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
                      fontSize: 24,
                      marginLeft: 10,
                    }}
                  >
                    {custo.name}
                  </Text>
                </View>
              ))}
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
              }}
              onPress={() => saveUpdates()}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ItemScreen;

const styles = StyleSheet.create({
  dropdown: {
    height: 30,

    borderColor: "black",
    borderWidth: 0.5,
    paddingHorizontal: 3,
    paddingVertical: 2,
    width: "30%",
    marginHorizontal: 10,
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
