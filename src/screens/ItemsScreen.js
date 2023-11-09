import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts, Roles } from "../constants";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import CreateItemModel from "../components/models/CreateItemModel";
import AddButton from "../components/AddButton";
import CreateCategoryModel from "../components/models/CreateCategoryModel";

import { filterMenuItems, filterRestaurantMenuItems } from "../utils/filters";
import { deleteMenuItem, getMenuItems } from "../services/MenuItemServices";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import {
  getRestaurantItems,
  updateRestaurantItemAvailability,
} from "../services/RestaurantServices";

const ItemsScreen = () => {
  const { role, restaurant } = useSelector(selectStaffData);

  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateItemModel, setShowCreateItemModel] = useState(false);
  const [showCreateCategoryModel, setShowCreateCategoryModel] = useState(false);

  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const fetchData = async () => {
    setIsLoading(true);
    if (role === Roles.ADMIN) {
      getMenuItems()
        .then((response) => {
          if (response?.status) {
            setMenuItems(response?.data);
            setMenuItemsList(response?.data);
          } else {
            console.log("getUsers false");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getRestaurantItems(restaurant)
        .then((response) => {
          if (response.status) {
            setMenuItems(response?.data.menu_items);
            setMenuItemsList(response?.data.menu_items);
          } else {
            Alert.alert("Intern Error");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleShowMenuItemModel = (id) => {
    navigation.navigate("Item", { id });
  };
  const handleShowDeleteWarning = (id) => {
    setMenuItem(id);
    setDeleteWarningModelState(true);
  };

  const updateAvailability = async (itemId, index) => {
    updateRestaurantItemAvailability(restaurant, itemId).then((response) => {
      if (response.status) {
        const updatedMenuItems = [...menuItems];

        // Modify the availability of the specific item at the given index
        updatedMenuItems[index] = {
          ...updatedMenuItems[index],
          availability: !updatedMenuItems[index].availability, // Change the availability (toggling in this example)
        };

        // Update the state with the modified array
        setMenuItems(updatedMenuItems);
      }
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={menuItem}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cet article ?`}
          deleter={deleteMenuItem}
        />
      )}

      {showCreateCategoryModel && (
        <CreateCategoryModel
          setShowCreateCategoryModel={setShowCreateCategoryModel}
        />
      )}
      {showCreateItemModel && (
        <CreateItemModel
          setShowCreateItemModel={setShowCreateItemModel}
          setRefresh={setRefresh}
        />
      )}
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Articles
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          {role === Roles.ADMIN ? (
            <SearchBar
              setter={setMenuItems}
              list={menuItemsList}
              filter={filterMenuItems}
            />
          ) : (
            <SearchBar
              setter={setMenuItems}
              list={menuItemsList}
              filter={filterRestaurantMenuItems}
            />
          )}
          {role === Roles.ADMIN && (
            <AddButton setShowModel={setShowCreateItemModel} text="Article" />
          )}
          {role === Roles.ADMIN && (
            <AddButton
              setShowModel={setShowCreateCategoryModel}
              text="Catégorie"
            />
          )}
          {role === Roles.ADMIN && (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
                borderWidth: 1,
                borderRadius: 5,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => navigation.navigate("Categories")}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 20,
                  color: "black",
                  marginLeft: 10,
                }}
              >
                Liste des catégories
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {menuItems.length > 0 ? (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {role === Roles.ADMIN
              ? menuItems.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.row,
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Image
                      style={[styles.image]}
                      source={{ uri: item.image }}
                    />
                    <Text style={[styles.rowCell, { width: "15%" }]}>
                      {item.name}
                    </Text>

                    <Text style={[styles.rowCell, { width: "15%" }]}>
                      {item.prices.map((price, index) =>
                        index !== item.prices.length - 1
                          ? price.size[0] + "/"
                          : price.size[0]
                      )}
                    </Text>
                    <Text style={[styles.rowCell, { flex: 1 }]}>
                      {item.prices.map((price, index) =>
                        index != item.prices.length - 1
                          ? price.price + "/"
                          : price.price
                      )}{" "}
                    </Text>

                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => handleShowMenuItemModel(item._id)}
                    >
                      <FontAwesome name="pencil" size={24} color="#2AB2DB" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => handleShowDeleteWarning(item._id)}
                    >
                      <MaterialIcons name="delete" size={24} color="#F31A1A" />
                    </TouchableOpacity>
                  </View>
                ))
              : menuItems.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.row,
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Image
                      style={[styles.image]}
                      source={{ uri: item.menuItem.image }}
                    />
                    <Text style={[styles.rowCell, { width: "20%" }]}>
                      {item.menuItem.name}
                    </Text>

                    <Text style={[styles.rowCell, { width: "15%" }]}>
                      {item.menuItem.prices.map((price, index) =>
                        index !== item.menuItem.prices.length - 1
                          ? price.size[0] + "/"
                          : price.size[0]
                      )}
                    </Text>
                    <Text style={[styles.rowCell, { flex: 1 }]}>
                      {item.menuItem.prices.map((price, index) =>
                        index != item.menuItem.prices.length - 1
                          ? price.price + "/"
                          : price.price
                      )}{" "}
                    </Text>

                    <Switch
                      trackColor={{ false: "#767577", true: Colors.primary }}
                      thumbColor="black"
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => updateAvailability(item._id, index)}
                      value={item.availability}
                    />
                  </View>
                ))}
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 16,
              marginTop: 20,
            }}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
              Aucun Article
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ItemsScreen;

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
