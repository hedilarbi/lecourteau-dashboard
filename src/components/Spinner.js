import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import React from "react";

const Spinner = ({ visibility }) => {
  return (
    <Modal animationType="slide" visible={visibility} transparent={true}>
      <View
        style={{
          justifyContent: "center",
          flex: 1,
          alignContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    </Modal>
  );
};

export default Spinner;

const styles = StyleSheet.create({});
