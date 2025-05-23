import { View, Text, Alert, ActivityIndicator, ScrollView } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getInitialStats, getRestaurantStats } from "../services/statsServices";
import { Colors, Fonts, Roles } from "../constants";
import StatsContainer from "../components/StatsContainer";
import OnGoingOrders from "../components/OnGoingOrders";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { useSelector } from "react-redux";
import StaffCard from "../components/StaffCard";
import { useFocusEffect } from "@react-navigation/native";
import RefreshButton from "../components/buttons/RefreshButton";
import { selectGlobalRefresh } from "../redux/slices/globalRefreshSlice";
import StatsCard from "../components/StatsCard";
const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [usersCount, setUsersCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [onGoingOrders, setOnGoingOrders] = useState([]);
  const [restaurantsStats, setRestaurantsStats] = useState([]);
  const staff = useSelector(selectStaffData);
  const globalRefresh = useSelector(selectGlobalRefresh);

  const loadHome = async () => {
    setIsLoading(true);

    if (staff.role === Roles.ADMIN) {
      getInitialStats()
        .then((response) => {
          if (response.status) {
            setUsersCount(response.data.usersCount);
            setRestaurantsStats(response.data.restaurantStats);
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
  }, [refresh, globalRefresh]);

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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
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
        {staff.role === Roles.ADMIN && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 30 }}>
              Statistiques{" "}
            </Text>
            {restaurantsStats.map((restaurant, index) => (
              <View key={index} style={{ marginTop: 20 }}>
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  {restaurant.restaurantName}
                </Text>
                <View style={{ flexDirection: "row", gap: 20, marginTop: 15 }}>
                  <StatsCard
                    title="Commande"
                    stat={restaurant.ordersCount}
                    icon="file-invoice-dollar"
                  />
                  <StatsCard
                    title="Revenues"
                    stat={restaurant.revenue + " $"}
                    icon="money-bill-wave"
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {staff.role !== Roles.ADMIN && (
          <View style={{ flex: 1, width: "100%", marginTop: 20 }}>
            <OnGoingOrders orders={onGoingOrders} setRefresh={setRefresh} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
