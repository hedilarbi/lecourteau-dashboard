import { View, Text, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { getInitialStats, getRestaurantStats } from "../services/statsServices";
import { Colors, Fonts, Roles } from "../constants";
import HomeFilter from "../components/HomeFilter";
import StatsContainer from "../components/StatsContainer";
import OnGoingOrders from "../components/OnGoingOrders";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { useSelector } from "react-redux";
import StaffCard from "../components/StaffCard";
const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [usersCount, setUsersCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [onGoingOrders, setOnGoingOrders] = useState([]);
  const staff = useSelector(selectStaffData);

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
    loadHome();
  }, [refresh]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return (
    <View style={{ padding: 24, flex: 1 }}>
      {/* <RefreshButton setRefresh={setRefresh} /> */}
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
        <StaffCard name={staff.name} />
      </View>
      {/* <HomeFilter /> */}
      <StatsContainer
        revenue={revenue}
        usersCount={usersCount}
        ordersCount={ordersCount}
        role={staff.role}
      />
      <View style={{ flex: 1, width: "100%", marginTop: 20 }}>
        <OnGoingOrders orders={onGoingOrders} />
      </View>
    </View>
  );
};

export default HomeScreen;
