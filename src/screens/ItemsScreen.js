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
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import CreateItemModel from "../components/models/CreateItemModel";
import AddButton from "../components/AddButton";
import CreateCategoryModel from "../components/models/CreateCategoryModel";
import useGetMenuItems from "../hooks/useGetMenuItems";
import { filterMenuItems } from "../utils/filters";
import { deleteMenuItem, getMenuItems } from "../services/MenuItemServices";
import ItemModel from "../components/models/ItemModel";
const ItemsScreen = () => {
  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateItemModel, setShowCreateItemModel] = useState(false);
  const [showCreateCategoryModel, setShowCreateCategoryModel] = useState(false);
  const [showMenuItemModel, setShowMenuItemModel] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const fetchData = async () => {
    setIsLoading(true);
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
          <SearchBar
            setter={setMenuItems}
            list={menuItemsList}
            filter={filterMenuItems}
          />
          <AddButton setShowModel={setShowCreateItemModel} text="Article" />
          <AddButton
            setShowModel={setShowCreateCategoryModel}
            text="Catégorie"
          />
        </View>
        {isLoading ? (
          <View
            style={{
              flex: 1,

              width: "100%",

              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size={"large"} color="black" />
          </View>
        ) : (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {menuItems.map((item, index) => (
              <View
                key={item._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Image style={[styles.image]} source={{ uri: item.image }} />
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
            ))}
          </ScrollView>
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
