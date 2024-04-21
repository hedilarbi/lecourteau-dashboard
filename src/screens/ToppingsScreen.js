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
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
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
import { useFocusEffect } from "@react-navigation/native";
import ErrorScreen from "../components/ErrorScreen";

const ToppingsScreen = () => {
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
          setToppings(response.data.toppings);
          setToppingsList(response.data.toppings);
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
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
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
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
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

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Personnalisations
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
              setter={setToppings}
              list={toppingsList}
              filter={filterToppings}
            />
          ) : (
            <SearchBar
              setter={setToppings}
              list={toppingsList}
              filter={filterRestaurantToppings}
            />
          )}
          {role === Roles.ADMIN && (
            <AddButton
              setShowModel={setShowCreateToppingModel}
              text="Personnalisation"
            />
          )}
          {role === Roles.ADMIN && (
            <AddButton
              setShowModel={setShowCreateToppingCategoryModel}
              text="Catégorie"
            />
          )}
        </View>

        <ScrollView
          style={{ width: "100%", marginTop: 30 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
          }
        >
          {role === Roles.ADMIN
            ? toppings.map((topping, index) => (
                <View
                  key={topping._id}
                  style={[
                    styles.row,
                    index % 2
                      ? { backgroundColor: "transparent" }
                      : { backgroundColor: "rgba(247,166,0,0.3)" },
                  ]}
                >
                  <Image
                    style={[styles.image]}
                    source={{ uri: topping.image }}
                  />

                  <Text style={[styles.rowCell, { width: "20%" }]}>
                    {topping.name}
                  </Text>

                  <Text style={[styles.rowCell, { width: "10%" }]}>
                    {topping.category.name}
                  </Text>
                  <Text style={[styles.rowCell, { width: "10%" }]}>
                    {topping.price} $
                  </Text>

                  <TouchableOpacity
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => handleShowUpdateToppingModal(topping)}
                  >
                    <FontAwesome name="pencil" size={30} color="#2AB2DB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => handleShowDeleteWarning(topping._id)}
                  >
                    <MaterialIcons name="delete" size={24} color="#F31A1A" />
                  </TouchableOpacity>
                </View>
              ))
            : toppings.map((topping, index) => (
                <View
                  key={topping._id}
                  style={[
                    styles.row,
                    index % 2
                      ? { backgroundColor: "transparent" }
                      : { backgroundColor: "rgba(247,166,0,0.3)" },
                  ]}
                >
                  <Image
                    style={[styles.image]}
                    source={{ uri: topping.topping.image }}
                  />

                  <Text style={[styles.rowCell, { width: "20%" }]}>
                    {topping.topping.name}
                  </Text>

                  <Text style={[styles.rowCell, { width: "10%" }]}>
                    {topping.topping.category.name}
                  </Text>
                  <Text style={[styles.rowCell, { width: "10%" }]}>
                    {topping.topping.price} $
                  </Text>

                  <Switch
                    trackColor={{ false: "#767577", true: Colors.primary }}
                    thumbColor="black"
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => updateAvailability(topping._id, index)}
                    value={topping.availability}
                  />
                </View>
              ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ToppingsScreen;

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
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
