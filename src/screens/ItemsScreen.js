import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors, Fonts, Roles } from "../constants";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import CreateItemModel from "../components/models/CreateItemModel";
import AddButton from "../components/AddButton";
import CreateCategoryModel from "../components/models/CreateCategoryModel";
import { Feather } from "@expo/vector-icons";
import { filterMenuItems, filterRestaurantMenuItems } from "../utils/filters";
import {
  deleteMenuItem,
  getCategories,
  getMenuItems,
  menuTri,
} from "../services/MenuItemServices";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import {
  getRestaurantItems,
  updateRestaurantItemAvailability,
} from "../services/RestaurantServices";
import ErrorScreen from "../components/ErrorScreen";
import MenuItemsFilter from "../components/MenuItemsFilter";
import RenderMenuItem from "../components/RenderMenuItem";
import Spinner from "../components/Spinner";

const ItemsScreen = () => {
  const { role, restaurant } = useSelector(selectStaffData);
  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateItemModel, setShowCreateItemModel] = useState(false);
  const [showCreateCategoryModel, setShowCreateCategoryModel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [menuItemFilter, setMenuItemFilter] = useState("Toutes les catégories");
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [showMenuFilter, setShowMenuFilter] = useState(false);
  const [error, setError] = useState(false);
  const flatList = useRef();

  const handleTri = async (from, to) => {
    const menuItemsCopy = [...menuItems];
    menuItemsCopy[from].order = to;
    menuItemsCopy[to].order = from;
    const temp = menuItemsCopy[from];
    menuItemsCopy[from] = menuItemsCopy[to];
    menuItemsCopy[to] = temp;
    setMenuItems(menuItemsCopy);
  };

  const discardTri = () => {
    setMenuItems(menuItemsList);
    setTriMode(false);
  };

  const saveTri = async () => {
    setIsTriLoading(true);
    try {
      const list = menuItems.map((item) => {
        return { id: item._id, order: item.order };
      });
      const response = await menuTri(list);
      if (response.status) {
        setMenuItemsList(menuItems);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setTriMode(false);
      setIsTriLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);

    try {
      if (role === Roles.ADMIN) {
        const [categoriesResponse, menuItemResponse] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        if (menuItemResponse?.status) {
          setMenuItemsList(menuItemResponse?.data);
          if (menuItemFilter === "Toutes les catégories") {
            setMenuItems(menuItemResponse?.data);
          } else {
            const list = menuItemResponse.data.filter(
              (item) => item.category.name === menuItemFilter
            );
            setMenuItems(list);
          }
        } else {
          setError(true);
        }
        if (categoriesResponse?.status) {
          setCategories(categoriesResponse?.data);
        } else {
          setError(true);
        }
      } else {
        const [categoriesResponse, menuItemResponse] = await Promise.all([
          getCategories(),
          getRestaurantItems(restaurant),
        ]);

        if (menuItemResponse.status) {
          setMenuItems(menuItemResponse?.data.menu_items);
          setMenuItemsList(menuItemResponse?.data.menu_items);
        } else {
          setError(true);
        }
        if (categoriesResponse.status) {
          setCategories(categoriesResponse?.data);
        } else {
          setError(true);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
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
        setRefresh(refresh + 1);
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

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
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
      {isTriLoading && <Spinner visibility={isTriLoading} />}

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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          {role === Roles.ADMIN && (
            <View>
              {triMode ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: Colors.primary,
                      paddingVertical: 10,
                      borderRadius: 5,
                      paddingHorizontal: 18,
                      justifyContent: "space-between",
                    }}
                    onPress={saveTri}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 18,
                      }}
                    >
                      Sauvegarder
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: Colors.tgry,
                      paddingVertical: 10,
                      borderRadius: 5,
                      paddingHorizontal: 18,
                      justifyContent: "space-between",
                    }}
                    onPress={discardTri}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 18,
                        color: "black",
                      }}
                    >
                      Annuler
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: Colors.primary,
                    paddingVertical: 10,
                    borderRadius: 5,
                    paddingHorizontal: 18,
                    justifyContent: "space-between",
                  }}
                  onPress={() => setTriMode(true)}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_BOLD,
                      fontSize: 18,
                    }}
                  >
                    Modifier l'ordre
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors.primary,
              paddingVertical: 10,
              borderRadius: 5,

              width: "15%",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
            onPress={() => setShowMenuFilter(!showMenuFilter)}
          >
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 18,
              }}
            >
              Filtre
            </Text>
            {showMenuFilter ? (
              <Feather name="chevron-up" size={24} color="black" />
            ) : (
              <Feather name="chevron-down" size={24} color="black" />
            )}
          </TouchableOpacity>
        </View>
        {showMenuFilter && (
          <MenuItemsFilter
            categories={categories}
            setMenuItemFilter={setMenuItemFilter}
            menuItemFilter={menuItemFilter}
            menuItemsList={menuItemsList}
            setMenuItems={setMenuItems}
            role={role}
          />
        )}

        {menuItems.length > 0 ? (
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <RenderMenuItem
                item={item}
                index={index}
                role={role}
                handleShowMenuItemModel={handleShowMenuItemModel}
                handleShowDeleteWarning={handleShowDeleteWarning}
                updateAvailability={updateAvailability}
                handleTri={handleTri}
                triMode={triMode}
              />
            )}
            ref={flatList}
            style={{ marginTop: 10 }}
            scrollEventThrottle={30}
          />
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
