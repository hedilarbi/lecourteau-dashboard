import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Fonts } from "../constants";
import { Entypo } from "@expo/vector-icons";

const ErrorScreen = ({ setRefresh }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Entypo name="warning" size={28} color="#C43131" />
        </View>
        <Text style={styles.title}>Oups, une erreur s&apos;est produite</Text>
        <Text style={styles.subtitle}>
          Vérifiez votre connexion et réessayez.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setRefresh((prev) => prev + 1)}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonLabel}>Rafraichir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.screenBg,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    minWidth: 280,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(196,49,49,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(196,49,49,0.25)",
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: Colors.tgry,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  buttonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
});
