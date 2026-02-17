import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";

import { Colors, Fonts } from "../constants";

import useGetUser from "../hooks/useGetUser";
import { convertDate } from "../utils/dateHandlers";
import { useRoute } from "@react-navigation/native";

import ErrorScreen from "../components/ErrorScreen";

const UserScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const { user, isLoading, error, setRefresh } = useGetUser(id);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.screenBg,
        }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topCard}>
          <View style={styles.topRow}>
            <Text style={styles.pageTitle}>{user.name || "Utilisateur"}</Text>
          </View>
          <View style={styles.metaRow}>
            {user.email ? (
              <Text style={[styles.metaItem, styles.metaItemPrimary]}>
                {user.email}
              </Text>
            ) : null}
            {user.phone_number ? (
              <Text style={styles.metaItem}>{user.phone_number}</Text>
            ) : null}
            {user.createdAt ? (
              <Text style={styles.metaItem}>
                Créé le {convertDate(user.createdAt)}
              </Text>
            ) : null}
            <Text style={styles.metaItem}>
              {user.fidelity_points ?? 0} points
            </Text>
            <Text style={styles.metaItem}>
              {user.orders?.length ?? 0} commande(s)
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Informations générales</Text>
              <Text style={styles.sectionSubtitle}>
                Coordonnées et statistiques client.
              </Text>
            </View>
          </View>
          <View style={styles.infoColumns}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom</Text>
                <Text style={styles.infoValue}>{user.name || "--"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{user.email || "--"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>
                  {user.phone_number || "--"}
                </Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Créé le</Text>
                <Text style={styles.infoValue}>
                  {user.createdAt ? convertDate(user.createdAt) : "--"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Points fidélité</Text>
                <Text style={styles.infoValue}>
                  {user.fidelity_points ?? 0} points
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Commandes</Text>
                <Text style={styles.infoValue}>
                  {user.orders?.length ?? 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Adresses</Text>
              <Text style={styles.sectionSubtitle}>
                Dernières adresses enregistrées.
              </Text>
            </View>
          </View>
          {user.addresses?.length > 0 ? (
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderCell, { flex: 1 }]}>
                  Adresse
                </Text>
              </View>
              {user.addresses.map((address, index) => (
                <View
                  key={address._id || index}
                  style={[styles.listRow, index % 2 === 0 && styles.listRowAlt]}
                >
                  <Text style={[styles.listCell, { flex: 1 }]}>
                    {address.address}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune adresse</Text>
              <Text style={styles.emptySubtitle}>
                Cet utilisateur n'a pas encore enregistré d'adresse.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Commandes</Text>
              <Text style={styles.sectionSubtitle}>
                Historique des commandes de l'utilisateur.
              </Text>
            </View>
          </View>
          {user.orders?.length > 0 ? (
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderCell, { flex: 1.2 }]}>
                  Date
                </Text>
                <Text style={[styles.listHeaderCell, { flex: 1 }]}>
                  Statut
                </Text>
                <Text style={[styles.listHeaderCell, { flex: 1 }]}>
                  Type
                </Text>
                <Text style={[styles.listHeaderCell, { flex: 0.8 }]}>
                  Total
                </Text>
                <Text style={[styles.listHeaderCell, { flex: 0.8 }]}>
                  Items
                </Text>
              </View>
              {user.orders.map((order, index) => (
                <View
                  key={order._id || index}
                  style={[styles.listRow, index % 2 === 0 && styles.listRowAlt]}
                >
                  <Text style={[styles.listCell, { flex: 1.2 }]}>
                    {convertDate(order.createdAt)}
                  </Text>
                  <Text style={[styles.listCell, { flex: 1 }]}>
                    {order.status}
                  </Text>
                  <Text style={[styles.listCell, { flex: 1 }]}>
                    {order.type}
                  </Text>
                  <Text style={[styles.listCell, { flex: 0.8 }]}>
                    {order.total_price.toFixed(2)} $
                  </Text>
                  <Text style={[styles.listCell, { flex: 0.8 }]}>
                    {order.orderItems?.length +
                      order.offers?.length +
                      order.rewards?.length}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptySubtitle}>
                Cet utilisateur n'a pas encore passé de commande.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  topCard: {
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  pageTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 34,
    color: "#1b1b1b",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  metaItem: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexShrink: 1,
    maxWidth: "100%",
  },
  metaItemPrimary: {
    color: Colors.primary,
    borderColor: "rgba(247,166,0,0.35)",
    backgroundColor: "rgba(247,166,0,0.12)",
  },
  card: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 26,
    color: "#1b1b1b",
  },
  sectionSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    marginTop: 2,
  },
  infoColumns: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  infoColumn: {
    flex: 1,
    gap: 10,
    minWidth: "48%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#1b1b1b",
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: Colors.tgry,
  },
  listContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.screenBg,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  listHeaderCell: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.tgry,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  listRowAlt: {
    backgroundColor: "rgba(247,166,0,0.08)",
  },
  listCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1b1b1b",
  },
  emptyState: {
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  emptySubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    marginTop: 4,
    textAlign: "center",
  },
});
