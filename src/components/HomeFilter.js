import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Colors, Fonts } from "../constants";

const HomeFilter = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.active_btn}>
        <Text style={styles.text_btn}>Aujourd'hui</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.inactive_btn}>
        <Text style={styles.text_btn}>Hebdomadaire</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.inactive_btn}>
        <Text style={styles.text_btn}>Mensuel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeFilter;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  active_btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inactive_btn: {
    paddingTop: 10,

    paddingHorizontal: 20,
    backgroundColor: Colors.tgry,
  },
  text_btn: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
  },
});
