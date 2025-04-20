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
import { FontAwesome, MaterialIcons, Entypo } from "@expo/vector-icons";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
const RenderMenuItem = ({
  item,
  index,
  role,
  handleShowMenuItemModel,
  handleShowDeleteWarning,
  updateAvailability,
  handleTri,
  triMode,
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

  return useMemo(
    () => (
      <View style={[styles.row, backgroundColor]}>
        <Image
          style={styles.image}
          source={{
            uri: role === Roles.ADMIN ? item.image : item.menuItem.image,
          }}
        />
        <Text style={[styles.rowCell, { width: "25%" }]}>{menuItemName}</Text>
        <View style={[styles.rowCell, { width: "10%" }]}>
          {prices.map((price, i) => (
            <Text key={i}>{price.size}</Text>
          ))}
        </View>
        <View style={[styles.rowCell, { flex: 1 }]}>
          {prices.map((price, i) => (
            <Text key={i}>{price.price.toFixed(2) + "$"}</Text>
          ))}
        </View>
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
            onValueChange={() => updateAvailability(item.menuItem._id, index)}
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
        {triMode && (
          <View style={{ justifyContent: "space-between", height: 100 }}>
            <TouchableWithoutFeedback
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
              }}
              onPress={() => handleTri(index, index - 1)}
            >
              <Entypo name="chevron-with-circle-up" size={28} color="black" />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
              }}
              onPress={() => handleTri(index, index + 1)}
            >
              <Entypo name="chevron-with-circle-down" size={28} color="black" />
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>
    ),
    [index, triMode]
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
    flexDirection: "column",
  },
});
