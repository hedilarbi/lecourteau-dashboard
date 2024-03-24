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
  PanResponder,
  FlatList,
  Animated,
  Button,
} from "react-native";
import React, {
  createRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors, Fonts, Roles } from "../constants";
import { FontAwesome, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import CreateItemModel from "../components/models/CreateItemModel";
import AddButton from "../components/AddButton";
import CreateCategoryModel from "../components/models/CreateCategoryModel";

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
  const [menuItem, setMenuItem] = useState("");
  const [menuItemFilter, setMenuItemFilter] = useState("Toutes les catégories");
  const [menuItems, setMenuItems] = useState([]);
  const [draggingIdx, setDraggingIdx] = useState(-1);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const point = useRef(new Animated.ValueXY()).current;
  const scrollOffset = useRef(0);
  const flatlistTopOffset = useRef(0);
  const rowHeight = useRef(0);
  const currentIdx = useRef(-1);
  const active = useRef(false);
  const currentY = useRef(0);
  const flatListHeight = useRef(0);
  const flatList = useRef();

  const indexB = useRef(-1);
  const initialIndex = useRef(-1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        currentIdx.current = yToIndex(gestureState.y0);
        initialIndex.current = currentIdx.current;
        currentY.current = gestureState.y0;

        Animated.event([{ y: point.y }], { useNativeDriver: false })({
          y: gestureState.y0 - rowHeight.current / 2,
        });
        active.current = true;
        setDragging(true);
        setDraggingIdx(currentIdx.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        currentY.current = gestureState.moveY;

        Animated.event([{ y: point.y }], { useNativeDriver: false })({
          y: gestureState.moveY,
        });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: () => {
        reset();
      },
      //onPanResponderTerminate: () => reset(),
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      },
    })
  ).current;
  const immutableMove = (arr, from, to) => {
    return arr
      .reduce((prev, current, idx, self) => {
        if (from === to) {
          prev.push({ ...current, order: idx });
        }
        if (idx === from) {
          return prev;
        }
        if (from < to) {
          prev.push({ ...current, order: idx });

          indexB.current = to;
        }
        if (idx === to) {
          prev.push({ ...self[from], order: to });
        }
        if (from > to) {
          prev.push({ ...current, order: idx });

          indexB.current = to;
        }
        return prev;
      }, [])
      .map((item, idx) => ({ ...item, order: idx }));
  };

  const animateList = () => {
    if (!active.current) {
      return;
    }

    requestAnimationFrame(() => {
      if (currentY.current + 100 > flatListHeight.current) {
        flatList.current.scrollToOffset({
          offset: scrollOffset.current + 10,
          animated: false,
        });
      } else if (currentY.current < 100) {
        flatList.current.scrollToOffset({
          offset: scrollOffset.current - 10,
          animated: false,
        });
      }
      const newIdx = yToIndex(currentY.current);
      if (currentIdx.current !== newIdx) {
        setMenuItems((prevData) =>
          immutableMove(prevData, currentIdx.current, newIdx)
        );
        setDraggingIdx(newIdx);
        currentIdx.current = newIdx;
      }

      animateList();
    });
  };

  const yToIndex = (y) => {
    const value = Math.floor(
      (scrollOffset.current + y - flatlistTopOffset.current) / rowHeight.current
    );

    if (value < 0) {
      return 0;
    }

    return value;
  };
  const reset = async () => {
    active.current = false;

    setDragging(false);
    setDraggingIdx(-1);
    setIsTriLoading(true);

    menuTri(initialIndex.current, indexB.current)
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        setIsTriLoading(false);
      });
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
          setMenuItems(menuItemResponse?.data);
          setMenuItemsList(menuItemResponse?.data);
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

  useEffect(() => {
    if (dragging) {
      animateList();
    }
  }, [dragging]);
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
        const updatedMenuItems = [...menuItems];
        updatedMenuItems[index] = {
          ...updatedMenuItems[index],
          availability: !updatedMenuItems[index].availability,
        };
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
      {isTriLoading && (
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

        <MenuItemsFilter
          categories={categories}
          setMenuItemFilter={setMenuItemFilter}
          menuItemFilter={menuItemFilter}
          menuItemsList={menuItemsList}
          setMenuItems={setMenuItems}
        />
        {dragging && (
          <Animated.View
            style={{
              backgroundColor: "black",
              zIndex: 2,
              position: "absolute",
              width: "100%",
              top: point.getLayout().top,
              left: 24,
            }}
          >
            <RenderMenuItem
              item={menuItems[draggingIdx]}
              rowHeight={rowHeight}
              role={role} // Make sure 'role' is accessible in this scope
              draggingIdx={draggingIdx} // Ensure 'draggingIdx' is accessible
              handleShowMenuItemModel={handleShowMenuItemModel} // Provide necessary functions
              handleShowDeleteWarning={handleShowDeleteWarning}
              updateAvailability={updateAvailability}
              panResponder={panResponder}
            />
          </Animated.View>
        )}
        {menuItems.length > 0 ? (
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <RenderMenuItem
                item={item}
                index={index}
                rowHeight={rowHeight}
                role={role} // Make sure 'role' is accessible in this scope
                draggingIdx={draggingIdx} // Ensure 'draggingIdx' is accessible
                handleShowMenuItemModel={handleShowMenuItemModel} // Provide necessary functions
                handleShowDeleteWarning={handleShowDeleteWarning}
                updateAvailability={updateAvailability}
                panResponder={panResponder}
              />
            )}
            ref={flatList}
            style={{ marginTop: 24 }}
            scrollEventThrottle={30}
            onScroll={(e) => {
              scrollOffset.current = e.nativeEvent.contentOffset.y;
            }}
            onLayout={(e) => {
              flatlistTopOffset.current = e.nativeEvent.layout.y;
              flatListHeight.current = e.nativeEvent.layout.height;
            }}
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
