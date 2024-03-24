import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Colors, Fonts } from "../constants";

const ErrorScreen = ({ setRefresh }) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
        Oups, une erreur s'est produite
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: Colors.primary,
          marginTop: 24,
          paddingHorizontal: 56,
          paddingVertical: 20,
        }}
        onPress={() => setRefresh((prev) => prev + 1)}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
          Rafraichir
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({});
