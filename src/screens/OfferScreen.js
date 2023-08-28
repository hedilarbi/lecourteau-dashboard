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
import { getOffer, updateOffer } from "../services/OffersServices";
import { Colors, Fonts } from "../constants";
import { useRoute } from "@react-navigation/native";
import { convertDate } from "../utils/dateHandlers";
import { getItemsNames } from "../services/MenuItemServices";
import { getToppings } from "../services/ToppingsServices";
import Calender from "../components/Calender";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import AddItemModel from "../components/models/AddItemMode";
import AddToppingModel from "../components/models/AddToppingModel";
import SuccessModel from "../components/models/SuccessModel";

const OfferScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [offer, setOffer] = useState({});
  const [updateMode, setUpdateMode] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [items, setItems] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [showAddItemModel, setShowAddItemModel] = useState(false);
  const [showAddToppingModel, setShowAddToppingModel] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [customizationsList, setCustomizationsList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    getOffer(id)
      .then((response) => {
        if (response.status) {
          setOffer(response.data);
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

  const deleteFromItems = (index) => {
    const updatedList = items.filter((item, i) => i !== index);
    setItems(updatedList);
  };

  const deleteFromCustomizations = (index) => {
    const updatedList = customizations.filter((item, i) => i !== index);
    setCustomizations(updatedList);
  };

  const activateUpdateMode = async () => {
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
      const date = new Date(offer.expireAt);
      setName(offer.name);
      setPrice(offer.price);
      setExpireAt(date);

      setCustomizations(offer.customizations);
      setItems(offer.items);
      setUpdateMode(true);
      setIsLoading(false);
    }
  };
  const saveUpdates = async () => {
    setIsLoading(true);
    updateOffer(
      id,

      name,
      price,
      expireAt,

      items,
      customizations
    )
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
          setOffer(response.data);
        } else {
          console.log(response);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
  return (
    <View style={{ flex: 1, backgroundColor: Colors.screenBg }}>
      {showSuccessModel && <SuccessModel />}
      {showAddItemModel && (
        <AddItemModel
          setShowAddItemModel={setShowAddItemModel}
          setItems={setItems}
          menuItems={menuItems}
        />
      )}
      {showAddToppingModel && (
        <AddToppingModel
          setShowAddCategoryModel={setShowAddToppingModel}
          setCustomizationsNames={setCustomizations}
          toppings={customizationsList}
        />
      )}
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
            source={{ uri: offer.image }}
            style={{
              width: 150,
              height: 100,
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
                  {offer.name}
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
                Price:
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
                    width: "20%",
                  }}
                  value={price.toString()}
                  onChangeText={(text) => setPrice(text)}
                />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 24,
                    marginLeft: 10,
                  }}
                >
                  {offer.price}
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
                Expire Date:
              </Text>
              {updateMode ? (
                <Calender setDate={setExpireAt} date={expireAt} />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 24,
                    marginLeft: 10,
                  }}
                >
                  {convertDate(offer.expireAt)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 28 }}>Items</Text>
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
              flexWrap: "wrap",
            }}
          >
            {items.map((item, index) => (
              <View
                key={item._id}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 50,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 24 }}>
                  {item.item.name} x {item.quantity}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 20 }}
                  onPress={() => deleteFromItems(index)}
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
              onPress={() => setShowAddItemModel(true)}
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
              flexWrap: "wrap",
            }}
          >
            {offer.items?.map((item) => (
              <View
                key={item._id}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 50,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 24 }}>
                  {item.item.name} x {item.quantity}
                </Text>
              </View>
            ))}
          </View>
        )}
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
            {customizations.map((custo, index) => (
              <View
                key={custo._id}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 50,
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
                  style={{ marginLeft: 10 }}
                  onPress={() => deleteFromCustomizations(index)}
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
              onPress={() => setShowAddToppingModel(true)}
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
              justifyContent: "space-between",
            }}
          >
            {offer.customizations?.map((custo) => (
              <View
                key={custo._id}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 50,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
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
  );
};

export default OfferScreen;

const styles = StyleSheet.create({});
