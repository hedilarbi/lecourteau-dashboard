import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
const AddItemModel = ({ setItems, menuItems, setShowAddItemModel }) => {
  const [item, setItem] = useState({});
  const [quantity, setQuantity] = useState(0);
  const [size, setSize] = useState("");
  const sizeRef = useRef(null);
  const itemRef = useRef(null);
  const quantityRef = useRef(null);
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (Object.keys(item).length > 0) {
      const selectedItem = menuItems.find((i) => i.value === item._id);
      const dropdownSizes = selectedItem.prices.map((l) => ({
        label: l.size,
        value: l.size,
      }));
      setSizes(dropdownSizes);
    }
  }, [item]);

  const addItem = () => {
    quantityRef.current.setNativeProps({
      style: { borderColor: Colors.primary, borderWidth: 2 },
    });

    if (quantity === 0 || quantity.length < 1) {
      quantityRef.current.setNativeProps({
        style: { borderColor: "red", borderWidth: 2 },
      });
      return;
    }
    if (size.length < 1) {
      setError("choisir la taille");
      return;
    }

    if (Object.keys(item).length < 1) {
      setError("choisir un article");
      return;
    }
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
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 16,
        backgroundColor: "white",
        paddingRight: 20,
        paddingLeft: 20,
        paddingVertical: 20,
        width: 500,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
          Ajouter un article
        </Text>
        <TouchableOpacity onPress={() => setShowAddItemModel(false)}>
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>
      </View>
      {error.length > 0 && (
        <Text
          style={{
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 20,
            color: "red",
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      )}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.text}>article</Text>
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
          placeholder="Article"
          value={item.name}
          ref={itemRef}
          onChange={(item) => setItem({ _id: item.value, name: item.label })}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.text}>Taille</Text>
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
          placeholder="Taille"
          value={size}
          ref={sizeRef}
          onChange={(item) => setSize(item.value)}
        />
      </View>
      <View
        style={{ flexDirection: "row", marginTop: 20, alignItems: "center" }}
      >
        <Text style={styles.text}>Quantité</Text>

        <TextInput
          style={{
            fontFamily: Fonts.LATO_REGULAR,
            fontSize: 20,
            paddingVertical: 5,
            paddingHorizontal: 8,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginLeft: 20,
          }}
          placeholder="0"
          ref={quantityRef}
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
        <Text style={styles.text}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddItemModel;

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  dropdown: {
    height: 40,
    width: 300,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
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
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
});
