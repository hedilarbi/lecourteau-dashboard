import {
  ActivityIndicator,
  Image,
  ScrollView,
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
import { convertDateToDate } from "../utils/dateHandlers";
import { getItemsNames } from "../services/MenuItemServices";
import { getToppings } from "../services/ToppingsServices";
import Calender from "../components/Calender";
import { AntDesign, Entypo } from "@expo/vector-icons";
import AddItemModel from "../components/models/AddItemMode";
import AddToppingModel from "../components/models/AddToppingModel";
import SuccessModel from "../components/models/SuccessModel";
import * as ImagePicker from "expo-image-picker";
import FailModel from "../components/models/FailModel";
import mime from "mime";
import { API_URL } from "@env";
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
  const [image, setImage] = useState("");
  const [showAddItemModel, setShowAddItemModel] = useState(false);
  const [showAddToppingModel, setShowAddToppingModel] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [customizationsList, setCustomizationsList] = useState([]);
  const [showFailModal, setShowFailModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    getOffer(id)
      .then((response) => {
        if (response.status) {
          setOffer(response.data);
        } else {
          setShowFailModal(true);
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
    if (showFailModal) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showFailModal]);

  useEffect(() => {
    fetchData();
  }, []);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,

      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
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
        setShowFailModal(true);
      }
      if (toppingResponse.status) {
        setCustomizationsList(toppingResponse.data);
      } else {
        setShowFailModal(true);
      }
    } catch (err) {
      setShowFailModal(true);
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
    // updateOffer(
    //   id,

    //   name,
    //   price,
    //   expireAt,

    //   items,
    //   customizations
    // )
    //   .then((response) => {
    //     if (response.status) {
    //       setShowSuccessModel(true);
    //       setOffer(response.data);
    //     } else {
    //       setShowFailModal(true);
    //     }
    //   })
    //   .finally(() => {
    //     setIsLoading(false);
    //   });
    const formdata = new FormData();
    if (image.length > 0) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
      formdata.append("fileToDelete", offer.image);
    }

    formdata.append("name", name);
    formdata.append("price", price);

    formdata.append("customizations", JSON.stringify(customizations));
    formdata.append("items", JSON.stringify(items));

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/offers/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formdata,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setOffer(data);
      setShowSuccessModel(true);
    } catch (err) {
      setShowFailModal(true);
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
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
    <ScrollView style={{ flex: 1, backgroundColor: Colors.screenBg }}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
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
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Annuler
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
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Modifier
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
          Informations
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
          {updateMode ? (
            <TouchableOpacity
              style={{
                width: 200,
                height: 200,
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
                <Image
                  source={{ uri: offer.image }}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "cover",
                    borderRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>
          ) : (
            <Image
              source={{ uri: offer.image }}
              style={{
                width: 200,
                height: 200,
                resizeMode: "cover",
                borderRadius: 10,
              }}
            />
          )}
          <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Nom:
              </Text>
              {updateMode ? (
                <TextInput
                  style={{
                    borderWidth: 2,

                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderColor: Colors.primary,
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                    width: "70%",
                  }}
                  value={name}
                  onChangeText={(text) => setName(text)}
                />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
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
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Prix:
              </Text>
              {updateMode ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    style={{
                      borderWidth: 2,

                      paddingHorizontal: 5,
                      paddingVertical: 5,
                      paddingHorizontal: 8,
                      borderColor: Colors.primary,
                      fontFamily: Fonts.LATO_REGULAR,
                      fontSize: 20,
                      marginLeft: 10,
                    }}
                    value={price.toString()}
                    onChangeText={(text) => setPrice(text)}
                  />
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
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {offer.price} $
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
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                Date d'éxpiration:
              </Text>
              {updateMode ? (
                <Calender setDate={setExpireAt} date={expireAt} />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {convertDateToDate(offer.expireAt)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
          Articles
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
              flexWrap: "wrap",
            }}
          >
            {items.map((item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors.primary,

                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 20 }}>
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
                flexDirection: "row",
              }}
              onPress={() => setShowAddItemModel(true)}
            >
              <Entypo name="plus" size={24} color="black" />
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 20,
                  marginLeft: 10,
                }}
              >
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",

              padding: 16,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            {offer.items?.map((item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors.primary,

                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 20 }}>
                  {item.item.name} x {item.quantity}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
          Personalisations
        </Text>
        {updateMode ? (
          <View
            style={{
              backgroundColor: "white",

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

                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
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
                flexDirection: "row",
              }}
              onPress={() => setShowAddToppingModel(true)}
            >
              <Entypo name="plus" size={24} color="black" />
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 20,
                  marginLeft: 10,
                }}
              >
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "white",

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

                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
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
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Sauvergarder
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default OfferScreen;

const styles = StyleSheet.create({});
