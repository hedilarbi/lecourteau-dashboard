import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { useSelector } from "react-redux";
import { getDriverOrders } from "../services/StaffServices";
import { Fonts, OrderStatus } from "../constants";
const DriverOrdersList = () => {
  const { _id } = useSelector(selectStaffData);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState(null);

  const handleOrderStatusColor = (status) => {
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

  const fetchData = async () => {
    try {
      const response = await getDriverOrders(_id);
      if (response.status) {
        setOrders(response.data);
      } else {
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchData().then(() => setIsLoading(false));
  }, []);
  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
  if (orders.length === 0) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
      >
        <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 18 }}>
          Pas de commandes
        </Text>
      </View>
    );
  }
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 8,
        paddingVertical: 12,
      }}
    >
      {orders?.map((order, index) => {
        let date = new Date(order.createdAt);
        date = date.toString("fr-FR", { month: "long" });
        date = date.substr(4, 17);
        return (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}
            key={index}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: "#D1D5DB",
                paddingBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 14,
                  color: handleOrderStatusColor(order.status),
                }}
              >
                {order.status}
              </Text>
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 14 }}>
                {date}
              </Text>
            </View>
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 14,
                  color: "#333333",
                }}
              >
                {order.total_price.toFixed(2)} $
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default DriverOrdersList;

const styles = StyleSheet.create({});
