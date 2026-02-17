import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { getInitialStats, getRestaurantStats } from "../services/statsServices";
import { Colors, Fonts, Roles } from "../constants";
import StatsContainer from "../components/StatsContainer";
import OnGoingOrders from "../components/OnGoingOrders";
import { selectStaffData, selectStaffToken } from "../redux/slices/StaffSlice";
import { useSelector } from "react-redux";
import StaffCard from "../components/StaffCard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import RefreshButton from "../components/buttons/RefreshButton";
import { selectGlobalRefresh } from "../redux/slices/globalRefreshSlice";
import StatsCard from "../components/StatsCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import { convertDateToDDMMYYYY } from "../utils/dateHandlers";
import PageHeader from "../components/ui/PageHeader";
const HomeScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [usersCount, setUsersCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [onGoingOrders, setOnGoingOrders] = useState([]);
  const [nonConfirmedOrders, setNonConfirmedOrders] = useState([]);
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
  const token = useSelector(selectStaffToken);
  const isAdmin = staff.role === Roles.ADMIN;

  const loadHome = async () => {
    setIsLoading(true);

    if (staff.role === Roles.ADMIN) {
      getInitialStats(date, null, null, token)
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
      getRestaurantStats(staff.restaurant, token)
        .then((response) => {
          if (response.status) {
            setOnGoingOrders(response.data.onGoingOrders || []);
            setNonConfirmedOrders(response.data.nonConfirmedOrders || []);
            setOrdersCount(response.data.ordersCount);
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
    }
  };

  useEffect(() => {
    loadHome();
  }, [refresh, globalRefresh]);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, []),
  );

  const fetchStatsAtDate = async () => {
    setIsDataFetching(true);
    try {
      const response = await getInitialStats(date, null, null, token);
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
      const response = await getInitialStats(null, from, to, token);
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

  const pickerValue =
    datePickerType === "date" ? date : datePickerType === "from" ? from : to;

  if (isLoading && isAdmin) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.screen}>
      {isDataFetching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      {isAdmin ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <PageHeader
            title="Accueil"
            subtitle="Vue d'ensemble"
            layout="split"
            rightContent={
              <View style={styles.actionsRow}>
                <RefreshButton setRefresh={setRefresh} />
                <StaffCard name={staff.name} />
              </View>
            }
          />

          {/* <TouchableOpacity
            style={styles.printerCard}
            onPress={() => navigation.navigate("PrinterTest")}
            activeOpacity={0.85}
          >
            <View style={styles.printerIndicator} />
            <View style={{ flex: 1 }}>
              <Text style={styles.printerTitle}>Test d&apos;impression</Text>
              <Text style={styles.printerSubtitle}>
                Vérifiez que votre imprimante est prête avant le rush.
              </Text>
            </View>
          </TouchableOpacity> */}
          {isAdmin && (
            <StatsContainer
              revenue={revenue}
              usersCount={usersCount}
              ordersCount={ordersCount}
              role={staff.role}
            />
          )}
          {isAdmin && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Statistiques</Text>
                  <Text style={styles.sectionSubtitle}>
                    Affinez vos chiffres par date ou intervalle
                  </Text>
                </View>
                <View style={styles.filterRow}>
                  <Pressable
                    style={[
                      styles.filterChip,
                      dateFilterType === "date" && styles.filterChipActive,
                    ]}
                    onPress={() => setDateFilterType("date")}
                  >
                    <Text
                      style={[
                        styles.filterChipLabel,
                        dateFilterType === "date" &&
                          styles.filterChipLabelActive,
                      ]}
                    >
                      Date
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.filterChip,
                      dateFilterType === "intervalle" &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => setDateFilterType("intervalle")}
                  >
                    <Text
                      style={[
                        styles.filterChipLabel,
                        dateFilterType === "intervalle" &&
                          styles.filterChipLabelActive,
                      ]}
                    >
                      Intervalle
                    </Text>
                  </Pressable>
                </View>
              </View>

              {dateFilterType === "date" && (
                <View style={styles.dateRow}>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => handleOpenDatePicker("date")}
                  >
                    <Text style={styles.dateLabel}>
                      {convertDateToDDMMYYYY(date)}
                    </Text>
                  </Pressable>

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => fetchStatsAtDate()}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.applyLabel}>Appliquer</Text>
                  </TouchableOpacity>
                </View>
              )}
              {dateFilterType === "intervalle" && (
                <View style={styles.dateRow}>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => handleOpenDatePicker("from")}
                  >
                    <Text style={styles.dateLabel}>
                      {convertDateToDDMMYYYY(from)}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => handleOpenDatePicker("to")}
                  >
                    <Text style={styles.dateLabel}>
                      {convertDateToDDMMYYYY(to)}
                    </Text>
                  </Pressable>

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => fetchStatsAtInterval()}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.applyLabel}>Appliquer</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.restaurantList}>
                {restaurantsStats.map((restaurant, index) => (
                  <View key={index} style={styles.restaurantCard}>
                    <View style={styles.restaurantHeader}>
                      <Text style={styles.restaurantTitle}>
                        {restaurant.restaurantName}
                      </Text>
                      <Text style={styles.restaurantSubtitle}>
                        Snapshot du moment
                      </Text>
                    </View>
                    <View style={styles.restaurantStatsRow}>
                      <StatsCard
                        title="Commande"
                        stat={restaurant.ordersCount ?? "--"}
                        icon="file-invoice-dollar"
                      />
                      <StatsCard
                        title="Revenues"
                        stat={
                          restaurant.revenue != null
                            ? `${restaurant.revenue} $`
                            : "--"
                        }
                        icon="money-bill-wave"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={pickerValue}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                handleDateChange(event, selectedDate);
              }}
            />
          )}
        </ScrollView>
      ) : (
        <View style={styles.nonAdminContent}>
          <PageHeader
            title="Accueil"
            subtitle="Vue d'ensemble"
            layout="split"
            rightContent={
              <View style={styles.actionsRow}>
                <RefreshButton setRefresh={setRefresh} />
                <StaffCard name={staff.name} />
              </View>
            }
          />
          <View style={styles.ordersRow}>
            <View style={styles.ordersColumn}>
              <OnGoingOrders
                title="Commandes à confirmer"
                orders={nonConfirmedOrders}
                setRefresh={setRefresh}
                token={token}
                showAddress={false}
                statusChipMode="scheduled"
                isLoading={isLoading}
                headerEmptySubtitle="Aucune commande à confirmer"
                countLabelSingular="commande à confirmer"
                countLabelPlural="commandes à confirmer"
                emptyTitle="Pas de commandes à confirmer"
                emptySubtitle="Les nouvelles commandes apparaîtront ici."
                showName={false}
              />
            </View>
            <View style={styles.ordersColumn}>
              <OnGoingOrders
                title="Commandes en cours"
                orders={onGoingOrders}
                setRefresh={setRefresh}
                token={token}
                showAddress={false}
                showName={true}
                confirmedStatusLabel="En cours"
                isLoading={isLoading}
                headerEmptySubtitle="Aucune commande en cours"
                countLabelSingular="commande en cours"
                countLabelPlural="commandes en cours"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.screenBg,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
    minHeight: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 50,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 18,
  },
  nonAdminContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  printerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.gry,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  printerIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  printerTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  printerSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    marginTop: 4,
  },
  sectionCard: {
    marginTop: 8,
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 30,
    color: "#1b1b1b",
  },
  sectionSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: Colors.tgry,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "white",
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
  },
  filterChipLabelActive: {
    color: "#1b1b1b",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    flexWrap: "wrap",
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "white",
  },
  dateLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
  },
  applyLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  restaurantList: {
    marginTop: 16,
    gap: 12,
  },
  restaurantCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  restaurantHeader: {
    marginBottom: 10,
  },
  restaurantTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
  },
  restaurantSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    marginTop: 2,
  },
  restaurantStatsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  ordersRow: {
    flex: 1,
    flexDirection: "row",
    gap: 18,
  },
  ordersColumn: {
    flex: 1,
    minWidth: 0,
  },
});

export default HomeScreen;
