import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";
const StatsCard = ({ icon, title, stat }) => {
  return (
    <View style={styles.card}>
      <View style={styles.info_container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.stat}>{stat}</Text>
      </View>
      <View>
        <FontAwesome5 name={icon} size={28} color={Colors.primary} />
      </View>
    </View>
  );
};

export default StatsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,

    width: "25%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    elevation: 5,
  },
  info_container: {},
  title: {
    fontSize: 16,
    fontFamily: Fonts.LATO_BOLD,
    color: Colors.tgry,
  },
  stat: {
    fontSize: 16,
    fontFamily: Fonts.LATO_BOLD,
    marginTop: 10,
  },
});
