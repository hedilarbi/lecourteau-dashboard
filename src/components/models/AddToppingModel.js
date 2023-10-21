import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
import { AntDesign } from "@expo/vector-icons";

const AddToppingModel = ({
  setShowAddCategoryModel,

  setCustomizationsNames,
  toppings,
}) => {
  const [name, setName] = useState({});
  const [error, setError] = useState("");
  const [toppingsNames, setToppingsNames] = useState([]);
  useEffect(() => {
    let list = [];
    toppings.map((item) => list.push({ value: item._id, label: item.name }));
    setToppingsNames(list);
  }, []);

  const save = () => {
    if (Object.keys(name).length < 1) {
      setError("Chosir une personalisation");
      return;
    }
    setCustomizationsNames((prevCusto) => [...prevCusto, name]);
    setShowAddCategoryModel(false);
  };
  return (
    <View
      style={{
        position: "absolute",
        alignSelf: "center",
        justifySelf: "center",
        zIndex: 2000,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: "white",
        paddingHorizontal: 40,
        paddingVertical: 20,
        width: 400,
      }}
    >
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
          Ajouter une Personalisation
        </Text>
        <TouchableOpacity onPress={() => setShowAddCategoryModel(false)}>
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>
      </View>
      {error.length > 0 && (
        <Text
          style={{
            color: "red",
            textAlign: "center",
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 20,
          }}
        >
          {error}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>Nom</Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          selectedStyle={styles.selectedStyle}
          itemContainerStyle={styles.itemContainerStyle}
          itemTextStyle={styles.itemTextStyle}
          containerStyle={styles.containerStyle}
          data={toppingsNames}
          maxHeight={300}
          labelField="label"
          valueField="label"
          placeholder="Chosir personalisation"
          value={name?.name}
          onChange={(item) => setName({ name: item.label, _id: item.value })}
        />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: Colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 5,
          marginTop: 40,
        }}
        onPress={save}
      >
        <Text
          style={{
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 20,
            textAlign: "center",
          }}
        >
          Ajouter
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddToppingModel;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(50,44,44,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  model: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "70%",
  },
  image: { flexDirection: "row", marginTop: 40, alignItems: "center" },
  text: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 22,
  },
  name: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
  },

  dropdown: {
    height: 30,
    width: 250,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 5,

    marginLeft: 20,
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
  priceBox: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginTop: 20,
  },
  prices: { marginTop: 40 },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
  },
  customizations: {
    marginTop: 40,
  },
});
