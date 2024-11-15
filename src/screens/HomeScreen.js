import { View, Text, Alert, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getInitialStats, getRestaurantStats } from "../services/statsServices";
import { Colors, Fonts, Roles } from "../constants";
import HomeFilter from "../components/HomeFilter";
import StatsContainer from "../components/StatsContainer";
import OnGoingOrders from "../components/OnGoingOrders";
import * as Notifications from "expo-notifications";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { useSelector } from "react-redux";
import StaffCard from "../components/StaffCard";
import { useFocusEffect } from "@react-navigation/native";
import RefreshButton from "../components/buttons/RefreshButton";
const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [usersCount, setUsersCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [onGoingOrders, setOnGoingOrders] = useState([]);
  const staff = useSelector(selectStaffData);
  const notificationListener = useRef();
  const responseListener = useRef();

  const loadHome = async () => {
    setIsLoading(true);

    if (staff.role === Roles.ADMIN) {
      getInitialStats()
        .then((response) => {
          if (response.status) {
            setOnGoingOrders(response.data.onGoingOrders);
            setOrdersCount(response.data.ordersCount);
            setUsersCount(response.data.usersCount);
            setRevenue(response.data.revenue);
          } else {
            Alert.alert(response.message);
          }
        })
        .catch((err) => {
          Alert.alert("Problème de connexion");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getRestaurantStats(staff.restaurant)
        .then((response) => {
          if (response.status) {
            setOnGoingOrders(response.data.onGoingOrders);
            setOrdersCount(response.data.ordersCount);
            setRevenue(response.data.revenue);
          } else {
            console.log(response.message);
            Alert.alert(response.message);
          }
        })
        .catch((err) => {
          Alert.alert("Problème de connexion");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        loadHome();
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        loadHome();
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    loadHome();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return (
    <View style={{ padding: 24, flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Accueil
        </Text>
        <View style={{ flexDirection: "row", gap: 24 }}>
          <RefreshButton setRefresh={setRefresh} />

          <StaffCard name={staff.name} />
        </View>
      </View>
      {/* <HomeFilter /> */}
      <StatsContainer
        revenue={revenue}
        usersCount={usersCount}
        ordersCount={ordersCount}
        role={staff.role}
      />
      <View style={{ flex: 1, width: "100%", marginTop: 20 }}>
        <OnGoingOrders orders={onGoingOrders} setRefresh={setRefresh} />
      </View>
    </View>
  );
};

export default HomeScreen;
