import {
  SafeAreaView,
  ScrollView,
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
import PageHeader from "../components/ui/PageHeader";

const AVAILABILITY_FILTERS = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
};

const ItemsScreen = () => {
  const { role, restaurant } = useSelector(selectStaffData);
  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateItemModel, setShowCreateItemModel] = useState(false);

  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [menuItemFilter, setMenuItemFilter] = useState("Toutes les catégories");
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState(
    AVAILABILITY_FILTERS.AVAILABLE
  );
  const [showMenuFilter, setShowMenuFilter] = useState(false);
  const [error, setError] = useState(false);
  const [updatingItemIds, setUpdatingItemIds] = useState([]);
  const flatList = useRef();
  const isAdmin = role === Roles.ADMIN;

  const getItemCategoryName = useCallback(
    (item) =>
      isAdmin
        ? item?.category?.name
        : item?.menuItem?.category?.name,
    [isAdmin]
  );

  const matchesAvailabilityFilter = useCallback(
    (item) => {
      if (isAdmin) {
        return true;
      }

      if (availabilityFilter === AVAILABILITY_FILTERS.UNAVAILABLE) {
        return item?.availability === false;
      }

      return item?.availability === true;
    },
    [availabilityFilter, isAdmin]
  );

  const applyCurrentFilters = useCallback(
    (list = []) => {
      const nextList = list.filter(matchesAvailabilityFilter);

      if (menuItemFilter === "Toutes les catégories") {
        return nextList;
      }

      return nextList.filter(
        (item) => getItemCategoryName(item) === menuItemFilter
      );
    },
    [getItemCategoryName, matchesAvailabilityFilter, menuItemFilter]
  );

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      if (isAdmin) {
        const [categoriesResponse, menuItemResponse] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        if (menuItemResponse?.status) {
          setMenuItemsList(menuItemResponse?.data);
          setMenuItems(applyCurrentFilters(menuItemResponse?.data));
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
          getRestaurantItems(restaurant, availabilityFilter),
        ]);

        if (menuItemResponse.status) {
          const nextMenuItems = menuItemResponse?.data?.menu_items || [];
          setMenuItemsList(nextMenuItems);
          setMenuItems(applyCurrentFilters(nextMenuItems));
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
  }, [
    applyCurrentFilters,
    availabilityFilter,
    isAdmin,
    menuItemFilter,
    restaurant,
  ]);
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData, refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );
  const handleShowMenuItemModel = (id) => {
    navigation.navigate("Item", { id });
  };
  const handleShowDeleteWarning = (id) => {
    setMenuItem(id);
    setDeleteWarningModelState(true);
  };

  const updateItemAvailabilityInState = (itemId, availability) => {
    const applyAvailability = (list = []) =>
      list.map((entry) => {
        const currentId = entry?._id || entry?.menuItem?._id;
        if (String(currentId) !== String(itemId)) {
          return entry;
        }

        if (role === Roles.ADMIN) {
          return {
            ...entry,
            availability,
          };
        }

        return {
          ...entry,
          availability,
        };
      });

    const nextList = applyAvailability(menuItemsList).filter(
      matchesAvailabilityFilter
    );
    setMenuItemsList(nextList);
    setMenuItems(applyCurrentFilters(nextList));
  };

  const updateAvailability = async (itemId) => {
    if (updatingItemIds.includes(String(itemId))) {
      return;
    }

    setUpdatingItemIds((prev) => [...prev, String(itemId)]);

    try {
      const response = await updateRestaurantItemAvailability(restaurant, itemId);

      if (response.status) {
        const nextAvailability =
          typeof response?.data?.availability === "boolean"
            ? response.data.availability
            : undefined;

        if (typeof nextAvailability === "boolean") {
          updateItemAvailabilityInState(itemId, nextAvailability);
        }
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("An error occurred while updating availability:", error);
    } finally {
      setUpdatingItemIds((prev) =>
        prev.filter((currentId) => currentId !== String(itemId))
      );
    }
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
    <SafeAreaView style={styles.screen}>
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

      {showCreateItemModel && (
        <CreateItemModel
          setShowCreateItemModel={setShowCreateItemModel}
          setRefresh={setRefresh}
        />
      )}

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Articles"
          subtitle="Gérez votre menu et ses disponibilités"
          pills={[{ label: `${menuItems.length} article(s)` }]}
          rightContent={
            <View style={styles.headerActions}>
              <View style={styles.searchRow}>
                {role === Roles.ADMIN ? (
                  <SearchBar
                    setter={setMenuItems}
                    list={menuItemsList}
                    filter={filterMenuItems}
                    placeholder="Chercher un article"
                  />
                ) : (
                  <SearchBar
                    setter={setMenuItems}
                    list={menuItemsList}
                    filter={filterRestaurantMenuItems}
                    placeholder="Chercher un article"
                  />
                )}
              </View>
              {role === Roles.ADMIN && (
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("Categories")}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.secondaryLabel}>
                      Gérer les catégories
                    </Text>
                    <Feather name="chevron-right" size={16} color="#1b1b1b" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("SizeGroups")}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.secondaryLabel}>
                      Gérer les groupes de tailles
                    </Text>
                    <Feather name="chevron-right" size={16} color="#1b1b1b" />
                  </TouchableOpacity>
                  <AddButton
                    setShowModel={setShowCreateItemModel}
                    text="Article"
                  />
                </View>
              )}
            </View>
          }
        />

        <View style={styles.filtersRow}>
          {isAdmin && (
            <View>
              {triMode ? (
                <View style={styles.triActions}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={saveTri}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.primaryLabel}>Sauvegarder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ghostButton}
                    onPress={discardTri}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.ghostLabel}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setTriMode(true)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.primaryLabel}>Modifier l&apos;ordre</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {!isAdmin && (
            <View style={styles.availabilityFilters}>
              <TouchableOpacity
                style={[
                  styles.availabilityButton,
                  availabilityFilter === AVAILABILITY_FILTERS.AVAILABLE &&
                    styles.availabilityButtonActive,
                ]}
                onPress={() =>
                  setAvailabilityFilter(AVAILABILITY_FILTERS.AVAILABLE)
                }
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.availabilityLabel,
                    availabilityFilter === AVAILABILITY_FILTERS.AVAILABLE &&
                      styles.availabilityLabelActive,
                  ]}
                >
                  Disponibles
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.availabilityButton,
                  availabilityFilter === AVAILABILITY_FILTERS.UNAVAILABLE &&
                    styles.availabilityButtonActive,
                ]}
                onPress={() =>
                  setAvailabilityFilter(AVAILABILITY_FILTERS.UNAVAILABLE)
                }
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.availabilityLabel,
                    availabilityFilter === AVAILABILITY_FILTERS.UNAVAILABLE &&
                      styles.availabilityLabelActive,
                  ]}
                >
                  Indisponibles
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.filterButton,
              showMenuFilter && styles.filterButtonActive,
            ]}
            onPress={() => setShowMenuFilter(!showMenuFilter)}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.filterLabel,
                showMenuFilter && styles.filterLabelActive,
              ]}
            >
              Filtre
            </Text>
            {showMenuFilter ? (
              <Feather name="chevron-up" size={18} color="#1b1b1b" />
            ) : (
              <Feather name="chevron-down" size={18} color="#1b1b1b" />
            )}
          </TouchableOpacity>
        </View>

        {showMenuFilter && (
          <View style={styles.filterCard}>
            <MenuItemsFilter
              categories={categories}
              setMenuItemFilter={setMenuItemFilter}
              menuItemFilter={menuItemFilter}
              menuItemsList={menuItemsList}
              setMenuItems={setMenuItems}
              role={role}
            />
          </View>
        )}

        <View style={styles.listCard}>
          {menuItems.length > 0 ? (
            <FlatList
              data={menuItems}
              keyExtractor={(item, index) =>
                String(item?._id || item?.menuItem?._id || index)
              }
              renderItem={({ item, index }) => (
                <RenderMenuItem
                  item={item}
                  index={index}
                  role={role}
                  handleShowMenuItemModel={handleShowMenuItemModel}
                  handleShowDeleteWarning={handleShowDeleteWarning}
                  updateAvailability={updateAvailability}
                  isUpdating={updatingItemIds.includes(
                    String(item?._id || item?.menuItem?._id)
                  )}
                  handleTri={handleTri}
                  triMode={triMode}
                />
              )}
              ref={flatList}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              scrollEventThrottle={30}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun Article</Text>
              <Text style={styles.emptySubtitle}>
                Ajoutez un article ou ajustez vos filtres.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItemsScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 24,
  },
  headerActions: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  searchRow: {
    width: "100%",
    minWidth: 260,
    height: 44,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  secondaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  availabilityFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 4,
  },
  availabilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  availabilityButtonActive: {
    backgroundColor: "black",
  },
  availabilityLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
  },
  availabilityLabelActive: {
    color: Colors.primary,
  },
  triActions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  primaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  ghostButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  ghostLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "white",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
  },
  filterLabelActive: {
    color: "#1b1b1b",
  },
  filterCard: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 12,
  },
  listCard: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  list: {
    width: "100%",
  },
  listContent: {
    paddingVertical: 6,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
  },
  emptySubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: Colors.tgry,
    marginTop: 4,
    textAlign: "center",
  },
});
