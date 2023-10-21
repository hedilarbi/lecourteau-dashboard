import { View, Text, TextInput } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";
const SearchBar = ({ setter, list, filter }) => {
  const filterList = (text) => {
    const newList = filter(list, text);
    setter(newList);
  };
  return (
    <View
      style={{
        backgroundColor: "white",
        flexDirection: "row",
        width: 300,
        alignItems: "center",
        paddingBottom: 4,
        paddingTop: 4,
        paddingLeft: 4,

        borderWidth: 1,
        borderRadius: 5,
      }}
    >
      <Entypo name="magnifying-glass" size={24} color={Colors.mgry} />
      <TextInput
        style={{
          fontFamily: Fonts.LATO_REGULAR,
          fontSize: 20,
          marginLeft: 5,
        }}
        placeholder="Chercher"
        onChangeText={(text) => filterList(text)}
        placeholderTextColor={Colors.mgry}
      />
    </View>
  );
};

export default SearchBar;
