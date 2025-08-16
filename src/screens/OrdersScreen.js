import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { Colors, Fonts, OrderStatus, Roles } from "../constants";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";

import {
  confirmOrder,
  deleteOrder,
  getOrderFiltred,
  getOrders,
  getRestaurantOrderFiltred,
} from "../services/OrdersServices";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { convertDate } from "../utils/dateHandlers";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import {
  getRestaurantList,
  getRestaurantOrders,
} from "../services/RestaurantServices";
import { filterOrdersByCode } from "../utils/filters";
import ErrorScreen from "../components/ErrorScreen";
import { Dropdown } from "react-native-element-dropdown";

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { role, restaurant } = useSelector(selectStaffData);
  const setOrderStatusColor = (status) => {
    switch (status) {
      case OrderStatus.READY:
        return "#2AB2DB";
      case OrderStatus.DONE:
        return "#2AB2DB";
      case OrderStatus.IN_DELIVERY:
        return "#2AB2DB";

      case OrderStatus.ON_GOING:
        return "#F3A32B";
      case OrderStatus.CANCELED:
        return "#FF0707";
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [orderId, setOrderId] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState("");
  const [navigaTo, setNavigaTo] = useState("");
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [restaurantList, setRestaurantList] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({
    label: "Tous",
    value: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      if (page < 1) {
        return;
      }
      if (pages !== 0 && page > pages) {
        return;
      }

      if (role === Roles.ADMIN) {
        const [response, response2] = await Promise.all([
          getOrderFiltred({
            page,
            limit: 20,
            status: filter,
            search,
            restaurant: selectedRestaurant.value,
          }),
          getRestaurantList(),
        ]);

        if (response.status) {
          setOrders(response.data.orders);
          setPages(response.data.pages);
        }
        if (response2.status) {
          let list = [
            {
              label: "Tous",
              value: "",
            },
          ];
          response2.data.map((r) =>
            list.push({
              label: r.name,
              value: r._id,
            })
          );
          setRestaurantList(list);
        }
      } else {
        const response = await getRestaurantOrderFiltred(restaurant, {
          page,
          limit: 20,
          status: filter,
          search,
        });
        if (response.status) {
          setOrders(response.data.orders);
          setPages(response.data.pages);
        }
      }
    } catch (e) {
      setError(true);
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [refresh, page, filter, selectedRestaurant]);

  const handleShowDeleteWarning = (id) => {
    setOrderId(id);
    setDeleteWarningModelState(true);
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchData();
  //   }, [])
  // );

  const confirm = async (id) => {
    try {
      const response = await confirmOrder(id);
      if (response.status) {
        setRefresh((prev) => prev + 1);
      } else {
        console.log(response.message);
        Alert.alert("Une erreur s'est produite");
      }
    } catch (e) {
      Alert.alert("Une erreur s'est produite");
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
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={orderId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette commande ?`}
          deleter={deleteOrder}
        />
      )}

      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
            Commandes
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                flexDirection: "row",
                width: 300,
                alignItems: "center",
                paddingBottom: 4,
                paddingTop: 4,
                paddingLeft: 4,

                borderWidth: 1,
                borderRadius: 5,
              }}
            >
              <Entypo name="magnifying-glass" size={24} color={Colors.mgry} />
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  marginLeft: 5,
                  flex: 1,
                }}
                placeholder="Chercher par nom"
                onChangeText={(text) => setSearch(text)}
                placeholderTextColor={Colors.mgry}
                value={search}
              />
            </View>
            <TouchableOpacity
              style={{
                marginLeft: 12,
                backgroundColor: Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={fetchData}
            >
              <Text style={{ color: "white" }}>Rechercher</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: Colors.primary,
            padding: 10,
            borderRadius: 10,
            justifyContent: "space-between",
            alignItems: "center",
            width: 140,
            marginTop: 15,
          }}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
            }}
          >
            Filtres
          </Text>
          {showFilters ? (
            <Entypo name="chevron-up" size={24} color="black" />
          ) : (
            <Entypo name="chevron-down" size={24} color="black" />
          )}
        </TouchableOpacity>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
            display: showFilters ? "flex" : "none",
          }}
        >
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === ""
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => setFilter("")}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Tout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.READY
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => setFilter(OrderStatus.READY)}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              {OrderStatus.READY}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.ON_GOING
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => setFilter(OrderStatus.ON_GOING)}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              {OrderStatus.ON_GOING}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.IN_DELIVERY
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => setFilter(OrderStatus.IN_DELIVERY)}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              {OrderStatus.IN_DELIVERY}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.DONE
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => setFilter(OrderStatus.DONE)}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              {OrderStatus.DONE}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            display: showFilters ? "flex" : "none",
            marginTop: 20,
          }}
        >
          <Dropdown
            style={[styles.dropdown]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            selectedStyle={styles.selectedStyle}
            itemContainerStyle={styles.itemContainerStyle}
            itemTextStyle={styles.itemTextStyle}
            containerStyle={styles.containerStyle}
            data={restaurantList}
            maxHeight={300}
            labelField="label"
            valueField="label"
            value={selectedRestaurant.label}
            onChange={(item) => setSelectedRestaurant(item)}
          />
        </View>
        <View style={{ flex: 1 }}>
          {orders.length > 0 ? (
            <ScrollView
              style={{
                width: "100%",
                marginTop: 15,
                borderWidth: 1,
                borderColor: "black",
              }}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {role === Roles.ADMIN
                ? orders.map((order, index) => (
                    <View
                      key={order._id}
                      style={[
                        styles.row,
                        index % 2
                          ? { backgroundColor: "transparent" }
                          : { backgroundColor: "rgba(247,166,0,0.3)" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rowCell,
                          {
                            width: "10%",
                            color: setOrderStatusColor(order.status),
                          },
                        ]}
                      >
                        {order.status}
                      </Text>
                      <Text style={[styles.rowCell, { width: "15%" }]}>
                        {order.code}
                      </Text>
                      <Text style={[styles.rowCell, { width: "10%" }]}>
                        {order.type === "delivery" ? "Livraison" : "Emporter"}
                      </Text>

                      <Text style={[styles.rowCell, { width: "10%" }]}>
                        {order.total_price.toFixed(2)} $
                      </Text>
                      <Text style={[styles.rowCell, { flex: 1 }]}>
                        {convertDate(order.createdAt)}
                      </Text>

                      <TouchableOpacity
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() =>
                          navigation.navigate("Order", { id: order._id })
                        }
                      >
                        <FontAwesome name="pencil" size={24} color="#2AB2DB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => handleShowDeleteWarning(order._id)}
                      >
                        <MaterialIcons
                          name="delete"
                          size={24}
                          color="#F31A1A"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                : orders.map((order, index) => (
                    <View
                      key={order._id}
                      style={[
                        styles.row,
                        index % 2
                          ? { backgroundColor: "transparent" }
                          : { backgroundColor: "rgba(247,166,0,0.3)" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rowCell,
                          {
                            width: "10%",
                            color: setOrderStatusColor(order.status),
                          },
                        ]}
                      >
                        {order.status}
                      </Text>
                      <Text style={[styles.rowCell, { width: "15%" }]}>
                        {order.code}
                      </Text>
                      <Text style={[styles.rowCell, { width: "10%" }]}>
                        {order.type === "delivery" ? "Livraison" : "Emporter"}
                      </Text>

                      <Text style={[styles.rowCell, { width: "10%" }]}>
                        {order.total_price.toFixed(2)} $
                      </Text>
                      {/* <Text style={[styles.rowCell, { flex: 1 }]}>
                        {convertDate(order.createdAt)}
                      </Text> */}
                      <View style={{ flex: 1 }}>
                        {!order.confirmed && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: "black",
                              width: "50%",
                              paddingHorizontal: 24,
                              paddingVertical: 8,
                              borderWidth: 1,
                              borderColor: "white",
                            }}
                            onPress={() => confirm(order._id)}
                          >
                            <Text style={{ color: "white" }}>Confirmer</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TouchableOpacity
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() =>
                          navigation.navigate("Order", { id: order._id })
                        }
                      >
                        <FontAwesome name="pencil" size={24} color="#2AB2DB" />
                      </TouchableOpacity>
                    </View>
                  ))}
            </ScrollView>
          ) : (
            <View
              style={{
                backgroundColor: "white",
                flex: 1,
                marginTop: 20,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
                Aucune Commande
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text
            style={{
              fontFamily: Fonts.LATO_REGULAR,
              fontSize: 20,
            }}
          >
            {"Page " + page + (pages > 0 ? "/" + pages : "")}
          </Text>
        </View>
        <View
          style={{
            marginTop: 16,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View>
            <TouchableOpacity
              onPress={() => setPage((prev) => prev - 1)}
              style={{
                backgroundColor: page <= 1 ? "gray" : Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              disabled={page <= 1}
            >
              <Text style={{ color: "white" }}>Précédent</Text>
            </TouchableOpacity>
          </View>
          {pages > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,

                  width: 100,
                  borderWidth: 1,
                  borderRadius: 5,
                  padding: 5,
                  borderColor: Colors.mgry,
                }}
                placeholder="Page"
                onChangeText={(text) => setNavigaTo(text)}
                placeholderTextColor={Colors.mgry}
                keyboardType="numeric"
                value={navigaTo}
              />
              <TouchableOpacity
                style={{
                  marginLeft: 12,
                  backgroundColor: Colors.primary,
                  padding: 10,
                  borderRadius: 10,
                }}
                onPress={() => {
                  setPage(parseInt(navigaTo));
                  setNavigaTo("");
                }}
              >
                <Text style={{ color: "white" }}>Rechercher</Text>
              </TouchableOpacity>
            </View>
          )}

          <View>
            <TouchableOpacity
              onPress={() => setPage((prev) => prev + 1)}
              style={{
                backgroundColor: page >= pages ? "gray" : Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              disabled={page >= pages}
            >
              <Text style={{ color: "white" }}>Suivant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
  dropdown: {
    height: 40,
    width: 350,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: Colors.primary,
  },
  selectedStyle: {
    height: 18,
  },
  icon: {
    marginRight: 5,
  },
  itemContainerStyle: {
    padding: 0,
    margin: 0,
  },
  itemTextStyle: {
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
});
