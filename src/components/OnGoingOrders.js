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
import { Colors, Fonts } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { confirmOrder } from "../services/OrdersServices";

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
  confirmedStatusLabel,
  isLoading = false,
  showName = true,
}) => {
  const navigation = useNavigation();
  const [confirmingMap, setConfirmingMap] = React.useState({});
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
      }
    } catch {
      Alert.alert("Erreur", "Une erreur s'est produite");
    } finally {
      setRefresh((prev) => prev + 1);
      setConfirmingMap((m) => ({ ...m, [id]: false }));
    }
  };

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
                const showScheduledChip =
                  statusChipMode === "scheduled" &&
                  order.status === "Programmé";
                const statusLabel = confirmedStatusLabel || order.status;
                return (
                  <View key={order._id || index}>
                    <Pressable
                      style={[
                        styles.orderRow,
                        index % 2 === 0 && styles.orderRowAlt,
                      ]}
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
                          {showName && (
                            <Text style={styles.address} numberOfLines={1}>
                              {order.user.name}
                            </Text>
                          )}

                          <View style={styles.chipsRow}>
                            <View
                              style={[
                                styles.chip,
                                order.type === "delivery"
                                  ? styles.deliveryChip
                                  : styles.pickupChip,
                              ]}
                            >
                              <Text style={styles.chipLabel}>
                                {order.type === "delivery"
                                  ? "Livraison"
                                  : "Emporter"}
                              </Text>
                            </View>
                            <View style={styles.chip}>
                              <Text style={styles.chipLabel}>
                                #{order.code}
                              </Text>
                            </View>
                            {showScheduledChip && (
                              <View style={[styles.chip, styles.statusChip]}>
                                <Text style={styles.chipLabel}>Programmé</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      <View style={styles.meta}>
                        <Text style={styles.price}>
                          {order.total_price.toFixed(2)} $
                        </Text>
                        <Text style={styles.metaLabel}>Total</Text>
                      </View>

                      {/* <View style={styles.action}>
                        {!order.confirmed ? (
                          <TouchableOpacity
                            style={[
                              styles.confirmButton,
                              isConfirming && styles.confirmButtonDisabled,
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
                              {isConfirming ? "Confirmation..." : "Confirmer"}
                            </Text>
                          </TouchableOpacity>
                        ) : statusLabel ? (
                          <View style={styles.statusPill}>
                            <Text style={styles.statusLabel}>
                              {statusLabel}
                            </Text>
                          </View>
                        ) : null}
                      </View> */}
                      {!order.confirmed && (
                        <View style={styles.action}>
                          <TouchableOpacity
                            style={[
                              styles.confirmButton,
                              isConfirming && styles.confirmButtonDisabled,
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
                              {isConfirming ? "Confirmation..." : "Confirmer"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
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
  orderInfoWrapper: {
    flex: 1,
  },
  orderInfo: {
    flex: 1,
    gap: 6,
  },
  orderInfoCompact: {
    gap: 0,
  },
  address: {
    fontSize: 16,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
    marginBottom: 10,
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
  statusChip: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderColor: "rgba(0,0,0,0.12)",
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  meta: {
    alignItems: "flex-end",
    minWidth: 90,
    gap: 4,
  },
  price: {
    fontSize: 22,
    fontFamily: Fonts.BEBAS_NEUE,
    color: "#1b1b1b",
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: Fonts.LATO_REGULAR,
    color: Colors.tgry,
  },
  action: {
    minWidth: 120,
    alignItems: "flex-end",
  },
  confirmButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.primary,
  },
  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  statusLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.tgry,
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
