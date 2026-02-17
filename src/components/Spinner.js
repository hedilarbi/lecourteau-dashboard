import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { Colors } from "../constants";

const Spinner = ({ visibility }) => {
  return (
    <Modal animationType="fade" visible={visibility} transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="black" />
        </View>
      </View>
    </Modal>
  );
};

export default Spinner;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    backgroundColor: Colors.gry,
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
});
