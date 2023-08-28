import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { Colors, Fonts } from "../constants";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import OrderModel from "../components/models/OrderModel";
import useGetOrders from "../hooks/useGetOrders";
import { deleteOrder, getOrders } from "../services/OrdersServices";
import { useNavigation } from "@react-navigation/native";
import { convertDate } from "../utils/dateHandlers";

const OrdersScreen = () => {
  const navigation = useNavigation();
  const setOrderStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "#2AB2DB";

      case "onGoing":
        return "#F3A32B";
      case "canceled":
        return "#FF0707";
      case "On Delivery":
        return "#2AED49";
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState("All");
  const [ordersList, setOrdersList] = useState([]);
  const [orders, setOrders] = useState([]);
  const fetchData = async () => {
    getOrders().then((response) => {
      if (response?.status) {
        setOrders(response?.data);
        setOrdersList(response.data);
      } else {
        console.log("getUsers false");
      }
    });
  };
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  }, [refresh]);

  const handleShowDeleteWarning = (id) => {
    setOrderId(id);
    setDeleteWarningModelState(true);
  };

  const filterOrders = (text) => {
    setFilter(text);
    let filteredOrders = [];
    if (text === "All") {
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

  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={orderId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={`Are you sure to delete this reward ?`}
          deleter={deleteOrder}
        />
      )}

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Orders List
        </Text>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
          }}
        >
          <SearchBar />
          <TouchableOpacity
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 30,
                alignItems: "center",
                borderWidth: 1,
              },
              filter === "All"
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders("All")}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              All
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
              filter === "onGoing"
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders("onGoing")}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              On Going
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
              filter === "on Delivery"
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders("on Delivery")}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              On Delivery
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
              filter === "Done"
                ? { backgroundColor: Colors.primary }
                : { backgroundColor: "white" },
            ]}
            onPress={() => filterOrders("Done")}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Done
            </Text>
          </TouchableOpacity>
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
          <View style={{ flex: 1 }}>
            {orders.length > 0 ? (
              <ScrollView
                style={{ width: "100%", marginTop: 30 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={fetchData}
                  />
                }
              >
                {orders.map((order, index) => (
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
                          width: "15%",
                          color: setOrderStatusColor(order.status),
                        },
                      ]}
                    >
                      {order.status}
                    </Text>

                    <Text style={[styles.rowCell, { width: "10%" }]}>
                      {order.type}
                    </Text>
                    <Text style={[styles.rowCell, { width: "10%" }]}>
                      {order.total_price} $
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
                      <MaterialIcons name="delete" size={24} color="#F31A1A" />
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
                <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 26 }}>
                  Empty
                </Text>
              </View>
            )}
          </View>
        )}
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
