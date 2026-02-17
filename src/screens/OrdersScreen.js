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
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Colors, Fonts, OrderStatus, Roles } from "../constants";
import DeleteWarning from "../components/models/DeleteWarning";

import {
  confirmOrder,
  deleteOrder,
  getOrderFiltred,
  getRestaurantOrderFiltred,
} from "../services/OrdersServices";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { convertDate } from "../utils/dateHandlers";
import { useSelector } from "react-redux";
import { selectStaffData, selectStaffToken } from "../redux/slices/StaffSlice";
import { getRestaurantList } from "../services/RestaurantServices";
import ErrorScreen from "../components/ErrorScreen";
import { Dropdown } from "react-native-element-dropdown";
import PageHeader from "../components/ui/PageHeader";

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
      case OrderStatus.PROGRAMMED:
        return "#14B8A6";
      case OrderStatus.CANCELED:
        return "#FF0707";
      default:
        return Colors.tgry;
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
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const token = useSelector(selectStaffToken);
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
            }),
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
    if (confirmingOrderId === id) {
      return;
    }

    setConfirmingOrderId(id);
    try {
      const response = await confirmOrder(id, token);
      if (response.status) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, confirmed: true } : order,
          ),
        );
      } else {
        console.log(response.message);
        Alert.alert("Une erreur s'est produite");
      }
    } catch (e) {
      Alert.alert("Une erreur s'est produite");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
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

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
        }
      >
        <PageHeader
          title="Commandes"
          subtitle="Filtrez, recherchez et gérez vos commandes en cours."
          pills={[
            { label: `${orders.length} commande(s)` },
            role === Roles.ADMIN
              ? { label: selectedRestaurant.label || "Tous les restaurants" }
              : null,
          ].filter(Boolean)}
          rightContent={
            <View style={styles.headerActions}>
              <View style={styles.searchInput}>
                <Entypo name="magnifying-glass" size={18} color={Colors.mgry} />
                <TextInput
                  style={styles.searchField}
                  placeholder="Chercher par nom ou code"
                  onChangeText={(text) => setSearch(text)}
                  placeholderTextColor={Colors.mgry}
                  value={search}
                />
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={fetchData}
                activeOpacity={0.9}
              >
                <Text style={styles.searchButtonLabel}>Rechercher</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => setShowFilters((prev) => !prev)}
                activeOpacity={0.85}
              >
                <Text style={styles.filterToggleLabel}>
                  {showFilters ? "Masquer" : "Afficher"} les filtres
                </Text>
                <Entypo
                  name={showFilters ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#1b1b1b"
                />
              </TouchableOpacity>
            </View>
          }
        />

        {showFilters && (
          <View style={styles.filtersCard}>
            <View style={styles.chipsRow}>
              {[
                { label: "Tout", value: "" },
                {
                  label: OrderStatus.PROGRAMMED,
                  value: OrderStatus.PROGRAMMED,
                },
                { label: OrderStatus.READY, value: OrderStatus.READY },
                { label: OrderStatus.ON_GOING, value: OrderStatus.ON_GOING },
                {
                  label: OrderStatus.IN_DELIVERY,
                  value: OrderStatus.IN_DELIVERY,
                },
                { label: OrderStatus.DONE, value: OrderStatus.DONE },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value || "all"}
                  style={[
                    styles.chip,
                    filter === option.value && styles.chipActive,
                  ]}
                  onPress={() => setFilter(option.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      filter === option.value && styles.chipLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {role === Roles.ADMIN && (
              <View style={styles.dropdownRow}>
                <Text style={styles.dropdownLabel}>Restaurant</Text>
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
            )}
          </View>
        )}

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>Statut</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Code</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Type</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Total</Text>
            {role === Roles.ADMIN && (
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Créé</Text>
            )}
            <Text style={[styles.headerCell, { width: 90 }]}>Actions</Text>
          </View>
          {orders.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {orders.map((order, index) => {
                const isAdmin = role === Roles.ADMIN;
                const isConfirming = confirmingOrderId === order._id;
                return (
                  <View
                    key={order._id}
                    style={[styles.row, index % 2 === 0 && styles.rowAlt]}
                  >
                    <View style={[styles.cell, { flex: 1.2 }]}>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: `${setOrderStatusColor(
                              order.status,
                            )}22`,
                            borderColor: `${setOrderStatusColor(
                              order.status,
                            )}55`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusLabel,
                            { color: setOrderStatusColor(order.status) },
                          ]}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cell, { flex: 1 }]}>{order.code}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      {order.type === "delivery" ? "Livraison" : "Emporter"}
                    </Text>

                    <Text style={[styles.cell, { flex: 1 }]}>
                      {order.total_price.toFixed(2)} $
                    </Text>
                    {isAdmin && (
                      <Text style={[styles.cell, { flex: 1.2 }]}>
                        {convertDate(order.createdAt)}
                      </Text>
                    )}

                    <View style={[styles.actions, { width: 90 }]}>
                      {!isAdmin && !order.confirmed && (
                        <TouchableOpacity
                          style={[
                            styles.confirmButton,
                            isConfirming && styles.confirmButtonDisabled,
                          ]}
                          onPress={() => confirm(order._id)}
                          disabled={isConfirming}
                        >
                          {isConfirming ? (
                            <ActivityIndicator size="small" color="#1b1b1b" />
                          ) : (
                            <Text style={styles.confirmLabel}>Confirmer</Text>
                          )}
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.iconButton, styles.editButton]}
                        onPress={() =>
                          navigation.navigate("Order", { id: order._id })
                        }
                      >
                        <Ionicons name="pencil" size={18} color="#1D4ED8" />
                      </TouchableOpacity>
                      {isAdmin && (
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleShowDeleteWarning(order._id)}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color="#C43131"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune Commande</Text>
              <Text style={styles.emptySubtitle}>
                Ajustez vos filtres ou rafraîchissez la liste.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.paginationInfo}>
          <Text style={styles.paginationLabel}>
            {`Page ${page}${pages > 0 ? `/${pages}` : ""}`}
          </Text>
        </View>
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={() => setPage((prev) => prev - 1)}
            style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
            disabled={page <= 1}
          >
            <Text style={styles.pageButtonLabel}>Précédent</Text>
          </TouchableOpacity>
          {pages > 0 && (
            <View style={styles.pageInputRow}>
              <TextInput
                style={styles.pageInput}
                placeholder="Page"
                onChangeText={(text) => setNavigaTo(text)}
                placeholderTextColor={Colors.mgry}
                keyboardType="numeric"
                value={navigaTo}
              />
              <TouchableOpacity
                style={styles.pageGoButton}
                onPress={() => {
                  const targetPage = parseInt(navigaTo, 10);
                  if (!isNaN(targetPage)) {
                    setPage(targetPage);
                  }
                  setNavigaTo("");
                }}
                disabled={!navigaTo}
              >
                <Text style={styles.pageButtonLabel}>Aller</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setPage((prev) => prev + 1)}
            style={[
              styles.pageButton,
              page >= pages && styles.pageButtonDisabled,
            ]}
            disabled={page >= pages}
          >
            <Text style={styles.pageButtonLabel}>Suivant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  filterToggleLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchField: {
    flex: 1,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    color: "#1b1b1b",
  },
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  searchButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  filtersCard: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    gap: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "white",
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.tgry,
  },
  chipLabelActive: {
    color: "#1b1b1b",
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dropdownLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  dropdown: {
    height: 44,
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
  selectedStyle: {
    height: 18,
  },
  itemContainerStyle: {
    padding: 0,
    margin: 0,
  },
  itemTextStyle: {
    fontSize: 16,
    padding: 8,
    margin: 0,
    fontFamily: Fonts.LATO_REGULAR,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 14,
    fontFamily: Fonts.LATO_REGULAR,
    color: Colors.tgry,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  tableCard: {
    flex: 1,
    backgroundColor: Colors.gry,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  headerCell: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.tgry,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableScroll: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  rowAlt: {
    backgroundColor: "rgba(247,166,0,0.08)",
  },
  cell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: "#1b1b1b",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
  confirmButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 12,
    color: "#1b1b1b",
  },
  emptyState: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
  },
  emptySubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: Colors.tgry,
    marginTop: 4,
    textAlign: "center",
  },
  paginationInfo: {
    alignItems: "center",
  },
  paginationLabel: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    color: Colors.tgry,
  },
  paginationRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  pageButtonDisabled: {
    backgroundColor: Colors.mgry,
  },
  pageButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  pageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pageInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    width: 90,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "white",
    color: "#1b1b1b",
  },
  pageGoButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
});
