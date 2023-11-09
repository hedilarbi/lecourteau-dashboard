import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
import { AntDesign } from "@expo/vector-icons";

const AddMenuItemPrice = ({
  setModalVisible,
  modalVisible,
  category,
  setPrices,
  prices,
}) => {
  const [size, setSize] = useState(null);
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState("");
  const priceRef = useRef(null);

  const addPrice = () => {
    if (price.length < 1) {
      priceRef.current.setNativeProps({
        style: { borderColor: "red", borderWidth: 2 },
      });
      return;
    }
    if (!size || size.length < 1) {
      setError("Chosir une taille");
      return;
    }
    if (size && price) {
      setPrices([...prices, { size, price }]);

      setSize(null);
      setPrice("");
      setModalVisible(false);
    }
  };

  const getDropdownOptions = () => {
    switch (category.toLowerCase()) {
      case "nos frites":
      case "nos poutines":
      case "nos poutines signatures":
      case "nos pizza":
        setSizes([
          { label: "petite", value: "petite" },
          { label: "moyenne", value: "moyenne" },
          { label: "grande", value: "grande" },
          { label: "familiale", value: "familiale" },
        ]);
        break;
      case "les entrées":
      case "nos assiettes":
        setSizes([
          { label: "1 morceau", value: "1 morceau" },
          { label: "2 morceaux", value: "2 morceaux" },
          { label: "3 morceaux", value: "3 morceaux" },
          { label: "4 morceaux", value: "4 morceaux" },
          { label: "5 morceaux", value: "5 morceaux" },
          { label: "6 morceaux", value: "6 morceaux" },
        ]);
        break;
      case "casse-croûte":
      case "nos sandwichs":
        setSizes([
          { label: "seul", value: "seul" },
          { label: "assiette", value: "assiette" },
        ]);
        break;
      // Add other cases for different categories
      default:
        setSizes([
          { label: "petite", value: "petite" },
          { label: "moyenne", value: "moyenne" },
          { label: "grande", value: "grande" },
          { label: "familiale", value: "familiale" },
        ]);
        break;
    }
  };
  useEffect(() => {
    getDropdownOptions();
  }, [category]);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 500,
        }}
      >
        <View
          style={{
            width: 500,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 2,
            borderColor: Colors.primary,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginLeft: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
              Ajouter un prix
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={40} color="gray" />
            </TouchableOpacity>
          </View>
          {error.length > 0 && (
            <Text
              style={{
                color: "red",
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 20,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
              marginVertical: 10,
            }}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Taille:
            </Text>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedStyle={styles.selectedStyle}
              itemContainerStyle={styles.itemContainerStyle}
              itemTextStyle={styles.itemTextStyle}
              containerStyle={styles.containerStyle}
              data={sizes}
              maxHeight={300}
              labelField="label"
              valueField="label"
              placeholder="Chosir Taille"
              value={size}
              onChange={(item) => {
                setSize(item.label);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              marginLeft: 10,
            }}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Prix:
            </Text>
            <TextInput
              placeholder="Prix"
              value={price}
              onChangeText={(text) => setPrice(text)}
              style={{
                borderWidth: 1,
                borderColor: Colors.primary,
                marginLeft: 10,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
              ref={priceRef}
            />
            <Text
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 20,
                marginLeft: 10,
              }}
            >
              $
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 40,
              backgroundColor: Colors.primary,
              padding: 10,
              borderRadius: 5,
            }}
            onPress={addPrice}
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
      </View>
    </Modal>
  );
};

export default AddMenuItemPrice;

const styles = StyleSheet.create({
  dropdown: {
    height: 30,
    width: 200,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,

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
    fontSize: 16,
    fontFamily: Fonts.LATO_REGULAR,
  },
});
