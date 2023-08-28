import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Fonts } from "../../constants";

const FailModel = ({ message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.model}>
        <Text style={{ fontFamily: Fonts.LATO_REGULAR, color: "white" }}>
          {message}
        </Text>
      </View>
    </View>
  );
};

export default FailModel;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    top: "20%",
    borderRadius: 10,
    alignItems: "center",

    zIndex: 100,
  },
  model: {
    backgroundColor: "red",
    borderRadius: 10,

    padding: 20,
  },
});
