import React from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts, OrderStatus } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { confirmOrder, updateStatus } from "../services/OrdersServices";
import {
  formatOrderStatus,
  normalizeOrderStatusValue,
} from "../utils/orderStatus";

const OnGoingOrders = ({
  orders = [],
  setRefresh,
  token,
  title = "Commandes en cours",
  headerEmptySubtitle = "Aucune commande en attente",
  countLabelSingular = "commande à suivre",
  countLabelPlural = "commandes à suivre",
  emptyTitle = "Pas de commandes en cours",
  emptySubtitle = "Vous serez averti dès qu'une nouvelle commande arrive.",
  showAddress = true,
  statusChipMode = "none",
  isLoading = false,
  showName = true,
  showDueDate = false,
  dueDateLabel = "Date due",
  rowColorMode = "alternate",
  showCode = true,
  showStatusDropdown = false,
  showCounterPaymentChip = false,
}) => {
  const navigation = useNavigation();
  const [confirmingMap, setConfirmingMap] = React.useState({});
  const [statusDraftMap, setStatusDraftMap] = React.useState({});
  const [statusUpdatingMap, setStatusUpdatingMap] = React.useState({});
  const statusOptions = React.useMemo(
    () => [
      { label: OrderStatus.ON_GOING, value: OrderStatus.ON_GOING },
      { label: OrderStatus.PROGRAMMED, value: OrderStatus.PROGRAMMED },
      { label: OrderStatus.READY, value: OrderStatus.READY },
      { label: OrderStatus.IN_DELIVERY, value: OrderStatus.IN_DELIVERY },
      {
        label: formatOrderStatus(OrderStatus.DELIVERED),
        value: OrderStatus.DELIVERED,
      },
      { label: OrderStatus.DONE, value: OrderStatus.DONE },
      { label: OrderStatus.CANCELED, value: OrderStatus.CANCELED },
    ],
    [],
  );
  const headerSubtitle =
    orders.length > 0
      ? `${orders.length} ${
          orders.length > 1 ? countLabelPlural : countLabelSingular
        }`
      : headerEmptySubtitle;

  const confirm = async (id) => {
    if (confirmingMap[id]) return;
    setConfirmingMap((m) => ({ ...m, [id]: true }));
    try {
      const response = await confirmOrder(id, token);
      if (!response.status) {
        Alert.alert("Échec de la confirmation");
      } else if (response.warning) {
        Alert.alert("Commande confirmée", response.warning);
      }
    } catch {
      Alert.alert("Erreur", "Une erreur s'est produite");
    } finally {
      setRefresh((prev) => prev + 1);
      setConfirmingMap((m) => ({ ...m, [id]: false }));
    }
  };

  const updateOrderStatusFromList = async (orderId, nextStatus) => {
    const normalizedNextStatus = normalizeOrderStatusValue(nextStatus);
    if (!orderId || !normalizedNextStatus) return;
    if (!token) {
      Alert.alert("Session expirée", "Reconnectez-vous pour modifier le statut.");
      return;
    }
    if (statusUpdatingMap[orderId]) return;

    setStatusUpdatingMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await updateStatus(orderId, normalizedNextStatus, token);
      if (!response.status) {
        Alert.alert(
          "Échec",
          response.message || "Impossible de mettre à jour le statut.",
        );
        return;
      }

      setStatusDraftMap((prev) => ({
        ...prev,
        [orderId]: normalizedNextStatus,
      }));
      setRefresh((prev) => prev + 1);
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite.");
    } finally {
      setStatusUpdatingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const isDeliveryType = React.useCallback((type) => {
    const normalizedType = String(type || "")
      .toLowerCase()
      .trim();
    return normalizedType === "delivery" || normalizedType === "devliery";
  }, []);

  const getDueDateValue = React.useCallback((order) => {
    const dueSource =
      order?.scheduled?.isScheduled && order?.scheduled?.scheduledFor
        ? order.scheduled.scheduledFor
        : order?.createdAt;

    if (!dueSource) return "--";

    const dueDate = new Date(dueSource);
    if (Number.isNaN(dueDate.getTime())) return "--";

    return dueDate.toLocaleString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
          >
            {orders.length > 0 ? (
              orders.map((order, index) => {
                const isConfirming = confirmingMap[order._id];
                const selectedStatus = normalizeOrderStatusValue(
                  statusDraftMap[order._id] || order?.status,
                );
                const isStatusUpdating = Boolean(statusUpdatingMap[order._id]);
                const isDeliveryOrder = isDeliveryType(order?.type);
                const isPickupOrder = !isDeliveryOrder;
                const hasUberCreationFailure =
                  isDeliveryOrder &&
                  Boolean(
                    order?.uber_creation_failed || order?.uber_creation_error,
                  );
                const isCounterPayment =
                  String(order?.payment_method || "").trim().toLowerCase() ===
                  "cash_at_counter";
                const showScheduledChip =
                  statusChipMode === "scheduled" && order?.scheduled?.isScheduled;
                const isAlreadyReady =
                  String(order?.status || "").trim().toLowerCase() ===
                  String(OrderStatus.READY).trim().toLowerCase();

                const rowStyles = [styles.orderRow];
                if (rowColorMode === "scheduled") {
                  rowStyles.push(
                    index % 2 === 0
                      ? styles.orderRowScheduledPrimary
                      : styles.orderRowScheduledSecondary,
                  );
                } else if (index % 2 === 0) {
                  rowStyles.push(styles.orderRowAlt);
                }

                return (
                  <View key={order._id || index}>
                    <Pressable
                      style={rowStyles}
                      onPress={() =>
                        navigation.navigate("HomeNav", {
                          screen: "Order",
                          params: { id: order._id },
                        })
                      }
                    >
                      <View style={styles.orderInfoWrapper}>
                        <View
                          style={[
                            styles.orderInfo,
                            !showAddress && styles.orderInfoCompact,
                          ]}
                        >
                          {showAddress && (
                            <Text style={styles.address} numberOfLines={1}>
                              {order.address}
                            </Text>
                          )}
                          <View style={styles.inlineRow}>
                            <View style={styles.inlineLeft}>
                                {showName && (
                                  <Text
                                    style={styles.customerName}
                                    numberOfLines={1}
                                  >
                                    {order.user?.name || "Client inconnu"}
                                  </Text>
                                )}

                                <View style={styles.chipsRow}>
                                <View
                                  style={[
                                    styles.chip,
                                    isDeliveryOrder
                                      ? styles.deliveryChip
                                      : styles.pickupChip,
                                  ]}
                                >
                                  <Text style={styles.chipLabel}>
                                    {isDeliveryOrder
                                      ? "Livraison"
                                      : "Emporter"}
                                  </Text>
                                </View>
                                {showCode && (
                                  <View style={styles.chip}>
                                    <Text style={styles.chipLabel}>
                                      #{order.code}
                                    </Text>
                                  </View>
                                )}
                                {showCounterPaymentChip &&
                                  isPickupOrder &&
                                  isCounterPayment && (
                                    <View
                                      style={[
                                        styles.chip,
                                        styles.counterPaymentChip,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.chipLabel,
                                          styles.counterPaymentChipLabel,
                                        ]}
                                      >
                                        Paiement au comptoir
                                      </Text>
                                    </View>
                                  )}
                                {showScheduledChip && (
                                  <View style={[styles.chip, styles.statusChip]}>
                                    <Text style={styles.chipLabel}>
                                      {order.status === "En cours"
                                        ? "En cours"
                                        : "Programmé"}
                                    </Text>
                                  </View>
                                )}
                                {hasUberCreationFailure && (
                                  <View
                                    style={[styles.chip, styles.uberErrorChip]}
                                  >
                                    <Text
                                      style={[
                                        styles.chipLabel,
                                        styles.uberErrorChipLabel,
                                      ]}
                                    >
                                      Uber Direct échoué
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            <View style={styles.inlineRight}>
                              <Text style={styles.price}>
                                {Number(order.total_price || 0).toFixed(2)} $
                              </Text>

                              {!order.confirmed && (
                                <TouchableOpacity
                                  style={[
                                    styles.confirmButton,
                                    styles.confirmButtonInline,
                                    isConfirming &&
                                      styles.confirmButtonDisabled,
                                  ]}
                                  onPress={(event) => {
                                    if (event?.stopPropagation) {
                                      event.stopPropagation();
                                    }
                                    confirm(order._id);
                                  }}
                                  disabled={isConfirming}
                                >
                                  <Text style={styles.confirmLabel}>
                                    {isConfirming
                                      ? "Confirmation..."
                                      : "Confirmer"}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                          {showDueDate && (
                            <View style={styles.dueTextRow}>
                              <Text style={styles.dueTextLabel}>
                                {dueDateLabel}: {getDueDateValue(order)}
                              </Text>
                            </View>
                          )}
                          {hasUberCreationFailure && (
                            <View style={styles.uberErrorMessage}>
                              <Text style={styles.uberErrorMessageText}>
                                {order?.uber_creation_error ||
                                  "La livraison Uber Direct n'a pas pu être créée. Ouvrez la commande pour relancer ou choisir un autre mode."}
                              </Text>
                            </View>
                          )}
                          {showStatusDropdown && (
                            <View
                              style={styles.quickStatusRow}
                              onTouchStart={(event) =>
                                event?.stopPropagation?.()
                              }
                            >
                              {isDeliveryOrder && (
                                <View style={styles.quickStatusDropdownWrap}>
                                  <Dropdown
                                    style={styles.quickStatusDropdown}
                                    placeholderStyle={styles.quickStatusPlaceholder}
                                    selectedTextStyle={styles.quickStatusSelected}
                                    itemContainerStyle={styles.quickStatusItemContainer}
                                    itemTextStyle={styles.quickStatusItemText}
                                    containerStyle={styles.quickStatusContainer}
                                    data={statusOptions}
                                    maxHeight={220}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Choisir l'état"
                                    value={selectedStatus || null}
                                    onChange={(item) => {
                                      const nextStatus =
                                        normalizeOrderStatusValue(item.value);
                                      setStatusDraftMap((prev) => ({
                                        ...prev,
                                        [order._id]: nextStatus,
                                      }));

                                      if (
                                        String(nextStatus || "").trim() !==
                                        String(
                                          normalizeOrderStatusValue(
                                            order?.status,
                                          ) || "",
                                        ).trim()
                                      ) {
                                        updateOrderStatusFromList(
                                          order._id,
                                          nextStatus,
                                        );
                                      }
                                    }}
                                  />
                                </View>
                              )}

                              {isPickupOrder && (
                                <TouchableOpacity
                                  style={[
                                    styles.pickupReadyButton,
                                    (isStatusUpdating || isAlreadyReady) &&
                                      styles.pickupReadyButtonDisabled,
                                  ]}
                                  disabled={isStatusUpdating || isAlreadyReady}
                                  onPress={(event) => {
                                    event?.stopPropagation?.();
                                    updateOrderStatusFromList(
                                      order._id,
                                      OrderStatus.READY,
                                    );
                                  }}
                                >
                                  {isStatusUpdating ? (
                                    <ActivityIndicator
                                      size="small"
                                      color={Colors.primary}
                                    />
                                  ) : (
                                    <Text style={styles.pickupReadyButtonLabel}>
                                      Prête
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default OnGoingOrders;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 24,
    color: "#1b1b1b",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    color: Colors.tgry,
    marginTop: 2,
    fontSize: 14,
  },
  card: {
    flex: 1,
    marginTop: 12,
    backgroundColor: Colors.gry,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  orderRow: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  orderRowAlt: {
    backgroundColor: "rgba(247, 165, 0, 0.19)",
  },
  orderRowScheduledPrimary: {
    backgroundColor: "rgba(56, 178, 86, 0.24)",
  },
  orderRowScheduledSecondary: {
    backgroundColor: "rgba(56, 178, 86, 0.12)",
  },
  orderInfoWrapper: {
    flex: 1,
  },
  orderInfo: {
    flex: 1,
    gap: 8,
  },
  orderInfoCompact: {
    gap: 6,
  },
  address: {
    fontSize: 16,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  inlineLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  inlineRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 8,
  },
  customerName: {
    fontSize: 16,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
    maxWidth: 170,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.screenBg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  deliveryChip: {
    backgroundColor: "rgba(247,166,0,0.18)",
    borderColor: "rgba(247,166,0,0.35)",
  },
  pickupChip: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderColor: "rgba(0,0,0,0.08)",
  },
  counterPaymentChip: {
    backgroundColor: "rgba(247,166,0,0.18)",
    borderColor: "rgba(180,83,9,0.22)",
  },
  statusChip: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderColor: "rgba(0,0,0,0.12)",
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  counterPaymentChipLabel: {
    color: "#92400E",
  },
  uberErrorChip: {
    backgroundColor: "rgba(220,38,38,0.12)",
    borderColor: "rgba(220,38,38,0.32)",
  },
  uberErrorChipLabel: {
    color: "#B91C1C",
  },
  uberErrorMessage: {
    marginTop: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(220,38,38,0.1)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.22)",
  },
  uberErrorMessageText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.LATO_BOLD,
    color: "#991B1B",
  },
  dueTextRow: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dueTextLabel: {
    fontSize: 13,
    fontFamily: Fonts.LATO_BOLD,
    color: "#111111",
  },
  price: {
    fontSize: 22,
    fontFamily: Fonts.BEBAS_NEUE,
    color: "#1b1b1b",
  },
  confirmButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  confirmButtonInline: {
    minWidth: 110,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.primary,
  },
  quickStatusRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  quickStatusDropdownWrap: {
    minWidth: 180,
    flex: 1,
    maxWidth: 260,
  },
  quickStatusDropdown: {
    height: 38,
    borderColor: "rgba(0,0,0,0.15)",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  quickStatusPlaceholder: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
  },
  quickStatusSelected: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
  },
  quickStatusItemContainer: {
    paddingVertical: 2,
  },
  quickStatusItemText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1b1b1b",
  },
  quickStatusContainer: {
    borderRadius: 10,
    borderWidth: 0,
  },
  pickupReadyButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 86,
  },
  pickupReadyButtonDisabled: {
    opacity: 0.65,
  },
  pickupReadyButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.primary,
  },
  emptyState: {
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingState: {
    flex: 1,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.LATO_REGULAR,
    color: Colors.tgry,
    marginTop: 6,
    textAlign: "center",
  },
});
