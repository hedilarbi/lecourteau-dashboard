import React, { useMemo } from "react";
import { Colors, Fonts, Roles } from "../constants";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
const RenderMenuItem = ({
  item,
  index,
  role,
  handleShowMenuItemModel,
  handleShowDeleteWarning,
  updateAvailability,
  handleTri,
}) => {
  const backgroundColor = useMemo(
    () =>
      index % 2
        ? { backgroundColor: "transparent" }
        : { backgroundColor: "rgba(247,166,0,0.3)" },
    [index]
  );

  const menuItemName = useMemo(
    () => (role === Roles.ADMIN ? item.name : item.menuItem.name),
    [role, item]
  );

  const prices = useMemo(
    () => (role === Roles.ADMIN ? item.prices : item.menuItem.prices),
    [role, item]
  );

  const renderPrices = useMemo(
    () =>
      prices.map((price, i) =>
        i !== prices.length - 1
          ? price.price.toFixed(2) + "/"
          : price.price.toFixed(2)
      ),
    [prices]
  );

  return useMemo(
    () => (
      <View style={[styles.row, backgroundColor]}>
        <Image
          style={styles.image}
          source={{
            uri: role === Roles.ADMIN ? item.image : item.menuItem.image,
          }}
        />
        <Text style={[styles.rowCell, { width: "15%" }]}>{menuItemName}</Text>
        <Text style={[styles.rowCell, { width: "10%" }]}>
          {prices.map((price, i) =>
            i !== prices.length - 1
              ? price.size[0].toUpperCase() + "/"
              : price.size[0].toUpperCase()
          )}
        </Text>
        <Text style={[styles.rowCell, { flex: 1 }]}>{renderPrices} $</Text>
        {role === Roles.ADMIN ? (
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => handleShowMenuItemModel(item._id)}
          >
            <FontAwesome name="pencil" size={24} color="#2AB2DB" />
          </TouchableOpacity>
        ) : (
          <Switch
            trackColor={{ false: "#767577", true: Colors.primary }}
            thumbColor="black"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateAvailability(item._id, index)}
            value={item.availability}
          />
        )}
        {role === Roles.ADMIN && (
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => handleShowDeleteWarning(item._id)}
          >
            <MaterialIcons name="delete" size={24} color="#F31A1A" />
          </TouchableOpacity>
        )}
        {role === Roles.ADMIN && (
          <View style={{ justifyContent: "space-between", height: 100 }}>
            <TouchableWithoutFeedback
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
              }}
              onPress={() => handleTri(item.order, item.order - 1)}
            >
              <Feather name="chevrons-up" size={28} color="black" />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
              }}
              onPress={() => handleTri(item.order, item.order + 1)}
            >
              <Feather name="chevrons-down" size={28} color="black" />
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>
    ),
    [index, item]
  );
};

export default RenderMenuItem;

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: 120,
    height: 100,
    resizeMode: "cover",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
