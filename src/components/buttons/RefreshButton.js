import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../constants";

const RefreshButton = ({ setRefresh }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setRefresh((prev) => prev + 1)}
      activeOpacity={0.85}
    >
      <Ionicons name="refresh" size={20} color="#1b1b1b" />
      <Text style={styles.label}>Rafraîchir</Text>
    </TouchableOpacity>
  );
};

export default RefreshButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
});
