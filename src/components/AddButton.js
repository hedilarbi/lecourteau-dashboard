import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";
const AddButton = ({ setShowModel, text }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: Colors.primary,
        paddingBottom: 10,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 10,
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => setShowModel(true)}
    >
      <Entypo name="plus" size={24} color="black" />
      <Text
        style={{
          fontFamily: Fonts.LATO_BOLD,
          fontSize: 18,
          color: "black",
          marginLeft: 10,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default AddButton;
