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
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ajouter un article</Text>
            <Text style={styles.subtitle}>
              Sélectionnez l'article, la taille et la quantité.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAddItemModel(false)}
          >
            <AntDesign name="close" size={28} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {error.length > 0 && <Text style={styles.errorBanner}>{error}</Text>}

        <View style={styles.field}>
          <Text style={styles.label}>Article</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemContainerStyle={styles.itemContainerStyle}
            itemTextStyle={styles.itemTextStyle}
            containerStyle={styles.containerStyle}
            data={menuItems}
            maxHeight={260}
            labelField="label"
            valueField="label"
            placeholder="Sélectionner un article"
            value={item.name}
            ref={itemRef}
            onChange={(item) => setItem({ _id: item.value, name: item.label })}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Taille</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemContainerStyle={styles.itemContainerStyle}
            itemTextStyle={styles.itemTextStyle}
            containerStyle={styles.containerStyle}
            data={sizes}
            maxHeight={260}
            labelField="label"
            valueField="label"
            placeholder="Sélectionner une taille"
            value={size}
            ref={sizeRef}
            onChange={(item) => setSize(item.value)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Quantité</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            ref={quantityRef}
            keyboardType="numeric"
            onChangeText={(text) => setQuantity(text)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={addItem}>
          <Text style={styles.saveLabel}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddItemModel;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(50,44,44,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  card: {
    width: "90%",
    maxWidth: 560,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 22,
    color: "#111827",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gry,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    backgroundColor: "rgba(225,79,79,0.12)",
    borderColor: "rgba(225,79,79,0.4)",
    borderWidth: 1,
    color: Colors.danger,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    padding: 10,
    borderRadius: 10,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    backgroundColor: Colors.gry,
    color: "#111827",
  },
  dropdown: {
    height: 46,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.gry,
  },
  itemContainerStyle: {
    paddingVertical: 8,
  },
  itemTextStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_REGULAR,
    color: "#111827",
  },
  containerStyle: {
    marginTop: -25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  placeholderStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_REGULAR,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_BOLD,
    color: "#111827",
  },
  saveButton: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  saveLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
});
