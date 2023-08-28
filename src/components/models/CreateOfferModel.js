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
import { Entypo } from "@expo/vector-icons";
import { getItemsNames } from "../../services/MenuItemServices";
import Calender from "../Calender";
import AddItemModel from "./AddItemMode";
import { createOffer } from "../../services/OffersServices";
import SuccessModel from "./SuccessModel";
import { getToppings } from "../../services/ToppingsServices";
import AddToppingModel from "./AddToppingModel";

const CreateOfferModel = ({ setShowCreateOfferModel, setRefresh }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showAddItemModel, setShowAddItemModel] = useState(false);
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [customizationsList, setCustomizationsList] = useState([]);
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [customizationsNames, setCustomizationsNames] = useState([]);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
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
          list.push({ value: item._id, label: item.name });
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

  const saveItem = async () => {
    setIsLoading(true);
    createOffer(name, items, price, date, customizationsNames)
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
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
        setRefresh((prev) => prev + 1);

        setShowCreateOfferModel(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);

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
          onPress={() => setShowCreateOfferModel(false)}
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
          <View style={styles.customizations}>
            <Text style={styles.text}>Items</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              {items.map((item) => (
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
                  key={item._id}
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
                onPress={() => setShowAddItemModel(true)}
              >
                <Entypo name="plus" size={24} color="black" />
                <Text style={styles.text}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.customizations}>
            <Text style={styles.text}>Customizations</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              {customizationsNames.map((item) => (
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
          <View style={styles.prices}>
            <Text style={styles.text}>Expire Date</Text>

            <Calender setDate={setDate} date={date} />
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

    borderRadius: 5,
  },
  customizations: {
    marginTop: 40,
  },
});
