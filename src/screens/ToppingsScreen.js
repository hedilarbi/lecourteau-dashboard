import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Switch,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import { Colors, Fonts, Roles } from "../constants";
import { MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateToppingModel from "../components/models/CreateToppingModel";
import CreateToppingCategoryModel from "../components/models/CreateToppingCategoryModel";

import { deleteTopping, getToppings } from "../services/ToppingsServices";
import { ActivityIndicator } from "react-native";
import { filterRestaurantToppings, filterToppings } from "../utils/filters";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import {
  getRestaurantToppings,
  updateRestaurantToppingAvailability,
} from "../services/RestaurantServices";
import UpdateToppingModal from "../components/models/UpdateToppingModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ErrorScreen from "../components/ErrorScreen";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";

const AVAILABILITY_FILTERS = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
};

const ToppingsScreen = () => {
  const navigation = useNavigation();
  const { role, restaurant } = useSelector(selectStaffData);
  const isAdmin = role === Roles.ADMIN;
  const [toppings, setToppings] = useState([]);
  const [toppingsList, setToppingsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateToppingModal, setShowUpdateToppingModal] = useState(false);
  const [showCreateToppingModel, setShowCreateToppingModel] = useState(false);
  const [showCreateToppingCategoryModel, setShowCreateToppingCategoryModel] =
    useState(false);
  const [toppingId, setToppingId] = useState();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [topping, setTopping] = useState(null);
  const [error, setError] = useState(false);
  const [updatingToppingIds, setUpdatingToppingIds] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState(
    AVAILABILITY_FILTERS.AVAILABLE
  );
  const matchesAvailabilityFilter = useCallback(
    (item) => {
      if (role === Roles.ADMIN) {
        return true;
      }

      if (availabilityFilter === AVAILABILITY_FILTERS.UNAVAILABLE) {
        return item?.availability === false;
      }

      return item?.availability === true;
    },
    [availabilityFilter, role]
  );

  const applyCurrentFilters = useCallback(
    (list = []) => {
      return list.filter(matchesAvailabilityFilter);
    },
    [matchesAvailabilityFilter]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      if (role === Roles.ADMIN) {
        const response = await getToppings();

        if (response.status) {
          setToppingsList(response.data);
          setToppings(applyCurrentFilters(response.data));
          setError(false);
        } else {
          setError(true);
        }
      } else {
        const response = await getRestaurantToppings(restaurant, availabilityFilter);

        if (response.status) {
          setToppingsList(response.data);
          setToppings(applyCurrentFilters(response.data));
          setError(false);
        } else {
          setError(true);
        }
      }
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [applyCurrentFilters, availabilityFilter, role, restaurant]);

  const updateToppingAvailabilityInState = (toppingId, availability) => {
    const applyAvailability = (list = []) =>
      list.map((entry) => {
        const currentId = entry?._id || entry?.topping?._id;
        if (String(currentId) !== String(toppingId)) {
          return entry;
        }

        return {
          ...entry,
          availability,
        };
      });

    const nextList = applyAvailability(toppingsList).filter(
      matchesAvailabilityFilter
    );
    setToppingsList(applyAvailability(toppingsList));
    setToppings(applyCurrentFilters(nextList));
  };

  const updateAvailability = async (toppingId) => {
    if (updatingToppingIds.includes(String(toppingId))) {
      return;
    }

    setUpdatingToppingIds((prev) => [...prev, String(toppingId)]);

    try {
      const response = await updateRestaurantToppingAvailability(restaurant, toppingId);

      if (response.status) {
        const nextAvailability =
          typeof response?.data?.availability === "boolean"
            ? response.data.availability
            : undefined;

        if (typeof nextAvailability === "boolean") {
          updateToppingAvailabilityInState(toppingId, nextAvailability);
        } else {
          updateToppingAvailabilityInState(toppingId, !toppingsList.find(t => String(t._id || t.topping?._id) === String(toppingId))?.availability);
        }
      }
    } finally {
      setUpdatingToppingIds((prev) =>
        prev.filter((currentId) => currentId !== String(toppingId))
      );
    }
  };

  useEffect(() => {
    fetchData().then(() => setIsLoading(false));
  }, [fetchData, refresh]);
  const handleShowDeleteWarning = (id) => {
    setToppingId(id);
    setDeleteWarningModelState(true);
  };
  const handleShowUpdateToppingModal = (topping) => {
    setTopping(topping);
    setShowUpdateToppingModal(true);
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchData();
  //   }, [])
  // );

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={toppingId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette personalisation ?`}
          deleter={deleteTopping}
        />
      )}
      {showCreateToppingModel && (
        <CreateToppingModel
          setShowCreateToppingModel={setShowCreateToppingModel}
          setRefresh={setRefresh}
        />
      )}
      {showUpdateToppingModal && (
        <UpdateToppingModal
          setShowUpdateToppingModal={setShowUpdateToppingModal}
          setRefresh={setRefresh}
          topping={topping}
        />
      )}
      {showCreateToppingCategoryModel && (
        <CreateToppingCategoryModel
          setShowCreateToppingCategoryModel={setShowCreateToppingCategoryModel}
          setRefresh={setRefresh}
        />
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Personnalisations"
          subtitle="Ajoutez vos compléments et gérez leurs disponibilités."
          pills={[{ label: `${toppings.length} option(s)` }]}
          rightContent={
            <View style={styles.headerActions}>
              <View style={styles.searchRow}>
                {role === Roles.ADMIN ? (
                  <SearchBar
                    setter={setToppings}
                    list={toppingsList}
                    filter={filterToppings}
                    placeholder="Chercher une personnalisation"
                  />
                ) : (
                  <SearchBar
                    setter={setToppings}
                    list={toppingsList}
                    filter={filterRestaurantToppings}
                    placeholder="Chercher une personnalisation"
                  />
                )}
              </View>
              {role === Roles.ADMIN && (
                <View style={styles.headerButtons}>
                  <AddButton
                    setShowModel={setShowCreateToppingModel}
                    text="Personnalisation"
                  />
                  <AddButton
                    setShowModel={setShowCreateToppingCategoryModel}
                    text="Catégorie"
                  />
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("ToppingGroups")}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.secondaryLabel}>Gérer les groupes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
        />

        {!isAdmin && (
          <View style={styles.filtersRow}>
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
          </View>
        )}

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { width: 80 }]}>Visuel</Text>
            <Text style={[tableStyles.headerCell, { flex: 1.3 }]}>Nom</Text>
            <Text style={[tableStyles.headerCell, { flex: 1.2 }]}>
              Catégorie
            </Text>
            <Text style={[tableStyles.headerCell, { width: 90 }]}>Prix</Text>
            <Text
              style={[
                tableStyles.headerCell,
                { width: role === Roles.ADMIN ? 120 : 140 },
              ]}
            >
              {role === Roles.ADMIN ? "Actions" : "Disponibilité"}
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : toppings.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {role === Roles.ADMIN
                ? toppings.map((topping, index) => (
                    <View
                      key={topping._id}
                      style={[
                        tableStyles.row,
                        index % 2 === 0 && tableStyles.rowAlt,
                      ]}
                    >
                      <Image style={styles.thumb} source={{ uri: topping.image }} />

                      <Text style={[tableStyles.cell, { flex: 1.3 }]}>
                        {topping.name}
                      </Text>

                      <Text style={[tableStyles.cell, { flex: 1.2 }]}>
                        {topping.category.name}
                      </Text>
                      <Text style={[tableStyles.cell, { width: 90 }]}>
                        {topping.price?.toFixed
                          ? topping.price.toFixed(2)
                          : `${topping.price} `}
                        $
                      </Text>

                      <View style={[tableStyles.actions, { width: 120 }]}>
                        <TouchableOpacity
                          style={[tableStyles.iconButton, styles.editButton]}
                          onPress={() => handleShowUpdateToppingModal(topping)}
                        >
                          <Ionicons name="pencil" size={18} color="#1D4ED8" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={tableStyles.iconButton}
                          onPress={() => handleShowDeleteWarning(topping._id)}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color={Colors.danger}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                : toppings.map((topping, index) => (
                    <View
                      key={topping.topping._id}
                      style={[
                        tableStyles.row,
                        index % 2 === 0 && tableStyles.rowAlt,
                      ]}
                    >
                      <Image
                        style={styles.thumb}
                        source={{ uri: topping.topping.image }}
                      />

                      <Text style={[tableStyles.cell, { flex: 1.3 }]}>
                        {topping.topping.name}
                      </Text>

                      <Text style={[tableStyles.cell, { flex: 1.2 }]}>
                        {topping.topping.category.name}
                      </Text>
                      <Text style={[tableStyles.cell, { width: 90 }]}>
                        {topping.topping.price?.toFixed
                          ? topping.topping.price.toFixed(2)
                          : `${topping.topping.price} `}
                        $
                      </Text>

                      <View style={[tableStyles.actions, { width: 140 }]}>
                        {updatingToppingIds.includes(String(topping.topping._id)) ? (
                          <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                          <Switch
                            trackColor={{ false: "#767577", true: Colors.primary }}
                            thumbColor="black"
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() =>
                              updateAvailability(topping.topping._id)
                            }
                            value={topping.availability}
                          />
                        )}
                      </View>
                    </View>
                  ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune personnalisation</Text>
              <Text style={styles.emptySubtitle}>
                Ajoutez vos options ou ajustez votre recherche.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ToppingsScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
  },
  headerActions: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
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
    marginBottom: 8,
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
  searchRow: {
    width: "100%",
    minWidth: 260,
    height: 44,
  },
  tableCard: {
    flex: 1,
    overflow: "hidden",
  },
  tableScroll: {
    flex: 1,
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
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
  loader: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    minHeight: 200,
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
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
});
