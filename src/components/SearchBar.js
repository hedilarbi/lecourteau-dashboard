import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";

const SearchBar = ({
  setter,
  list = [],
  filter,
  placeholder = "Chercher",
  onChangeText,
  value,
}) => {
  const handleChange = (text) => {
    if (onChangeText) {
      onChangeText(text);
      return;
    }
    if (!filter || !setter) return;
    const newList = filter(list, text);
    setter(newList);
  };

  return (
    <View style={styles.container}>
      <Entypo name="magnifying-glass" size={18} color={Colors.mgry} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        onChangeText={handleChange}
        placeholderTextColor={Colors.mgry}
        value={value}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "white",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  input: {
    flex: 1,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
    textAlignVertical: "center",
    color: "#1b1b1b",
  },
});
