import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";

const StatsCard = ({ icon, title, stat }) => {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.stat}>{stat ?? "-"}</Text>
      </View>
      <View style={styles.iconContainer}>
        <FontAwesome5 name={icon} size={22} color="#1b1b1b" />
      </View>
    </View>
  );
};

export default StatsCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.gry,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.LATO_BOLD,
    color: Colors.tgry,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  stat: {
    fontSize: 24,
    fontFamily: Fonts.BEBAS_NEUE,
    marginTop: 6,
    color: "#1b1b1b",
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(247,166,0,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
});
