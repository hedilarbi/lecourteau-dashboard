import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { Colors, Fonts, OrderStatus, Roles } from "../constants";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";

import {
  confirmOrder,
  deleteOrder,
  getOrders,
} from "../services/OrdersServices";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { convertDate } from "../utils/dateHandlers";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { getRestaurantOrders } from "../services/RestaurantServices";
import { filterOrdersByCode } from "../utils/filters";
import ErrorScreen from "../components/ErrorScreen";

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

  const [orderId, setOrderId] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState("Tout");
  const [ordersList, setOrdersList] = useState([]);
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState([]);
  const fetchData = async () => {
    setIsLoading(true);
    if (role === Roles.ADMIN) {
      getOrders()
        .then((response) => {
          if (response?.status) {
            if (filter === "Tout") {
              setOrders(response?.data);
              setOrdersList(response.data);
            } else {
              setOrdersList(response.data);
              const list = response.data.filter(
                (order) => order.status === filter
              );
              setOrders(list);
            }
          } else {
            setError(true);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getRestaurantOrders(restaurant)
        .then((response) => {
          if (response?.status) {
            setOrders(response?.data.orders);

            setOrdersList(response?.data.orders);
          } else {
            setError(true);
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

  const handleShowDeleteWarning = (id) => {
    setOrderId(id);
    setDeleteWarningModelState(true);
  };

  const filterOrders = (text) => {
    setFilter(text);
    let filteredOrders = [];
    if (text === "Tout") {
      setOrders(ordersList);
    } else {
      ordersList.map((order) => {
        if (order.status === text) {
          filteredOrders.push(order);
        }
        setOrders(filteredOrders);
      });
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

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
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Commandes
        </Text>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
          }}
        >
          <SearchBar
            setter={setOrders}
            list={ordersList}
            filter={filterOrdersByCode}
          />
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 30,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === "Tout"
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders("Tout")}
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
                borderRadius: 30,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.ON_GOING
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders(OrderStatus.ON_GOING)}
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
                borderRadius: 30,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.IN_DELIVERY
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders(OrderStatus.IN_DELIVERY)}
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
                borderRadius: 30,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === OrderStatus.DONE
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders(OrderStatus.DONE)}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              {OrderStatus.DONE}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {orders.length > 0 ? (
            <ScrollView
              style={{ width: "100%", marginTop: 30 }}
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
});
