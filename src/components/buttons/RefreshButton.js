import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants";
const RefreshButton = ({ setRefresh }) => {
  return (
    <TouchableOpacity
      style={{
        alignSelf: "flex-end",
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
      }}
      onPress={() => setRefresh((prev) => prev + 1)}
    >
      <Ionicons name="refresh" size={48} color="black" />
    </TouchableOpacity>
  );
};

export default RefreshButton;

const styles = StyleSheet.create({});
