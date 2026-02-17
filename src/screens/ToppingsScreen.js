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

const ToppingsScreen = () => {
  const navigation = useNavigation();
  const { role, restaurant } = useSelector(selectStaffData);
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
  const fetchData = async () => {
    try {
      setIsLoading(true);

      if (role === Roles.ADMIN) {
        const response = await getToppings();

        if (response.status) {
          setToppings(response.data);
          setToppingsList(response.data);
          setError(false);
        } else {
          setError(true);
        }
      } else {
        const response = await getRestaurantToppings(restaurant);

        if (response.status) {
          setToppings(response.data);
          setToppingsList(response.data);
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
  };
  const updateAvailability = async (toppingId, index) => {
    updateRestaurantToppingAvailability(restaurant, toppingId).then(
      (response) => {
        if (response.status) {
          const updatedMenuItems = [...toppings];

          updatedMenuItems[index] = {
            ...updatedMenuItems[index],
            availability: !updatedMenuItems[index].availability,
          };
          setToppings(updatedMenuItems);
        }
      }
    );
  };
  useEffect(() => {
    fetchData().then(() => setIsLoading(false));
  }, [refresh]);
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
              {role === Roles.ADMIN && (
                <>
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
                </>
              )}
            </View>
          }
        />

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
                      key={topping._id}
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
                        <Switch
                          trackColor={{ false: "#767577", true: Colors.primary }}
                          thumbColor="black"
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={() =>
                            updateAvailability(topping._id, index)
                          }
                          value={topping.availability}
                        />
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
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
