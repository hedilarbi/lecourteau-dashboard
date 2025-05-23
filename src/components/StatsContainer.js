import { StyleSheet, Text, View } from "react-native";
import React from "react";
import StatsCard from "./StatsCard";
import { Roles } from "../constants";

const StatsContainer = ({ revenue, usersCount, ordersCount, role }) => {
  return (
    <View style={styles.container}>
      {role === Roles.ADMIN && (
        <StatsCard title="Utilisateur" stat={usersCount} icon="users" />
      )}
      {role !== Roles.ADMIN && (
        <StatsCard
          title="Commande"
          stat={ordersCount}
          icon="file-invoice-dollar"
        />
      )}
      {role !== Roles.ADMIN && (
        <StatsCard
          title="Revenues"
          stat={revenue + " $"}
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
    gap: 20,
    marginTop: 20,
  },
});
