import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { convertDateToDDMMYYYY } from "../utils/dateHandlers";
const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [usersCount, setUsersCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [onGoingOrders, setOnGoingOrders] = useState([]);
  const [restaurantsStats, setRestaurantsStats] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("date");
  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("date");
  const [isDataFetching, setIsDataFetching] = useState(false);
  const staff = useSelector(selectStaffData);
  const globalRefresh = useSelector(selectGlobalRefresh);

  const loadHome = async () => {
    setIsLoading(true);

    if (staff.role === Roles.ADMIN) {
      getInitialStats(date, null, null)
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

  const fetchStatsAtDate = async () => {
    setIsDataFetching(true);
    try {
      const response = await getInitialStats(date, null, null);
      if (response.status) {
        setUsersCount(response.data.usersCount);
        setRestaurantsStats(response.data.restaurantStats);
      } else {
        Alert.alert(response.message);
      }
    } catch (error) {
      Alert.alert("Problème de connexion");
    } finally {
      setIsDataFetching(false);
    }
  };

  const fetchStatsAtInterval = async () => {
    setIsDataFetching(true);
    try {
      const response = await getInitialStats(null, from, to);
      if (response.status) {
        setUsersCount(response.data.usersCount);
        setRestaurantsStats(response.data.restaurantStats);
      } else {
        Alert.alert(response.message);
      }
    } catch (error) {
      Alert.alert("Problème de connexion");
    } finally {
      setIsDataFetching(false);
    }
  };

  const handleOpenDatePicker = (type) => {
    setShowDatePicker(true);
    setDatePickerType(type);
  };

  const handleDateChange = (event, selectedDate) => {
    if (datePickerType === "date") {
      setShowDatePicker(false);
      setDate(selectedDate);
    } else if (datePickerType === "from") {
      setShowDatePicker(false);
      setFrom(selectedDate);
    }
    if (datePickerType === "to") {
      setShowDatePicker(false);
      setTo(selectedDate);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return (
    <View style={{ padding: 24, flex: 1 }}>
      {isDataFetching && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            opacity: 0.8,
            zIndex: 50,
          }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
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
            <View style={{ flexDirection: "row", gap: 20, marginTop: 15 }}>
              <Pressable
                style={
                  dateFilterType === "date"
                    ? {
                        backgroundColor: Colors.primary,
                        padding: 10,
                        borderRadius: 5,
                      }
                    : {
                        padding: 10,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: Colors.primary,
                      }
                }
                onPress={() => setDateFilterType("date")}
              >
                <Text
                  style={{
                    color:
                      dateFilterType === "date" ? Colors.white : Colors.black,
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 16,
                  }}
                >
                  Date
                </Text>
              </Pressable>
              <Pressable
                style={
                  dateFilterType === "intervalle"
                    ? {
                        backgroundColor: Colors.primary,
                        padding: 10,
                        borderRadius: 5,
                      }
                    : {
                        padding: 10,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: Colors.primary,
                      }
                }
                onPress={() => setDateFilterType("intervalle")}
              >
                <Text
                  style={{
                    color:
                      dateFilterType === "intervalle"
                        ? Colors.white
                        : Colors.black,
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 16,
                  }}
                >
                  Intervalle
                </Text>
              </Pressable>
            </View>
            {dateFilterType === "date" && (
              <View style={{ flexDirection: "row", gap: 20, marginTop: 15 }}>
                <Pressable
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.primary,
                    borderRadius: 5,
                    padding: 8,
                  }}
                  onPress={() => handleOpenDatePicker("date")}
                >
                  <Text>{convertDateToDDMMYYYY(date)}</Text>
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: Colors.primary,
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      fontFamily: Fonts.LATO_BOLD,
                    }}
                    onPress={() => fetchStatsAtDate()}
                  >
                    Appliquer
                  </Text>
                </Pressable>
              </View>
            )}
            {dateFilterType === "intervalle" && (
              <View style={{ flexDirection: "row", gap: 20, marginTop: 15 }}>
                <Pressable
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.primary,
                    borderRadius: 5,
                    padding: 8,
                  }}
                  onPress={() => handleOpenDatePicker("from")}
                >
                  <Text>{convertDateToDDMMYYYY(from)}</Text>
                </Pressable>
                <Pressable
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.primary,
                    borderRadius: 5,
                    padding: 8,
                  }}
                  onPress={() => handleOpenDatePicker("to")}
                >
                  <Text>{convertDateToDDMMYYYY(to)}</Text>
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: Colors.primary,
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      fontFamily: Fonts.LATO_BOLD,
                    }}
                    onPress={() => fetchStatsAtInterval()}
                  >
                    Appliquer
                  </Text>
                </Pressable>
              </View>
            )}
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
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              handleDateChange(event, selectedDate);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
