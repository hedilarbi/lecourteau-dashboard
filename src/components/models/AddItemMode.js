import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
const AddItemModel = ({ setItems, menuItems, setShowAddItemModel }) => {
  const [item, setItem] = useState({});
  const [quantity, setQuantity] = useState(0);
  const [size, setSize] = useState("");
  const sizes = [
    { value: "Petite", label: "Petite" },
    { value: "Moyenne", label: "Moyenne" },
    { value: "Familliale", label: "Familliale" },
  ];

  const addItem = () => {
    setItems((prev) => [...prev, { item, quantity, size }]);
    setShowAddItemModel(false);
  };
  return (
    <View
      style={{
        position: "absolute",
        alignSelf: "center",
        justifySelf: "center",
        zIndex: 2000,
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: "white",
        padding: 40,
      }}
    >
      <TouchableOpacity
        style={{ alignSelf: "flex-end" }}
        onPress={() => setShowAddItemModel(false)}
      >
        <AntDesign name="close" size={30} color="gray" />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.text}>Item</Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          selectedStyle={styles.selectedStyle}
          itemContainerStyle={styles.itemContainerStyle}
          itemTextStyle={styles.itemTextStyle}
          containerStyle={styles.containerStyle}
          data={menuItems}
          maxHeight={300}
          labelField="label"
          valueField="label"
          placeholder={""}
          value={item.name}
          onChange={(item) => setItem({ _id: item.value, name: item.label })}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.text}>Size</Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          selectedStyle={styles.selectedStyle}
          itemContainerStyle={styles.itemContainerStyle}
          itemTextStyle={styles.itemTextStyle}
          containerStyle={styles.containerStyle}
          data={sizes}
          maxHeight={300}
          labelField="label"
          valueField="label"
          placeholder={""}
          value={size}
          onChange={(item) => setSize(item.value)}
        />
      </View>
      <View
        style={{ flexDirection: "row", marginTop: 20, alignItems: "center" }}
      >
        <Text style={styles.text}>Quantity</Text>

        <TextInput
          style={{
            fontFamily: Fonts.LATO_REGULAR,
            fontSize: 18,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            borderWidth: 1,
            borderRadius: 5,
            marginLeft: 20,
          }}
          placeholder="0"
          keyboardType="numeric"
          onChangeText={(text) => setQuantity(text)}
        />
      </View>
      <TouchableOpacity
        style={{
          marginTop: 40,
          alignSelf: "flex-end",
          backgroundColor: Colors.primary,
          paddingHorizontal: 60,
          paddingVertical: 10,
          borderRadius: 5,
        }}
        onPress={addItem}
      >
        <Text style={styles.text}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddItemModel;

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 22,
  },
  dropdown: {
    height: 30,
    width: 200,
    borderColor: "gray",
    borderWidth: 0.5,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginLeft: 40,
    marginVertical: 20,
  },
  selectedStyle: {
    height: 18,
  },
  icon: {
    marginRight: 5,
  },
  itemContainerStyle: {
    padding: 0,
    margin: 0,
  },
  itemTextStyle: {
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 18,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 18,
    fontFamily: Fonts.LATO_REGULAR,
  },
});
