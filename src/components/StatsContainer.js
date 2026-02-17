import React from "react";
import { StyleSheet, View } from "react-native";
import StatsCard from "./StatsCard";
import { Roles } from "../constants";

const StatsContainer = ({ revenue, usersCount, ordersCount, role }) => {
  const formatRevenue = (value) =>
    value == null ? "--" : `${value} $`;

  return (
    <View style={styles.container}>
      {role === Roles.ADMIN && (
        <StatsCard title="Utilisateur" stat={usersCount ?? "--"} icon="users" />
      )}
      {role !== Roles.ADMIN && (
        <StatsCard
          title="Commande"
          stat={ordersCount ?? "--"}
          icon="file-invoice-dollar"
        />
      )}
      {role !== Roles.ADMIN && (
        <StatsCard
          title="Revenues"
          stat={formatRevenue(revenue)}
          icon="money-bill-wave"
        />
      )}
    </View>
  );
};

export default StatsContainer;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 24,
  },
});
