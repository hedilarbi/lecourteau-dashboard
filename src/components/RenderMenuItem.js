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
import { FontAwesome, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
const RenderMenuItem = ({
  item,
  index,
  role,
  draggingIdx,
  handleShowMenuItemModel,
  handleShowDeleteWarning,
  updateAvailability,
  panResponder,
  rowHeight,
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
      <View
        style={[
          styles.row,
          backgroundColor,
          { opacity: draggingIdx === index ? 0 : 1 },
        ]}
        onLayout={(e) => {
          rowHeight.current = e.nativeEvent.layout.height;
        }}
      >
        <Image
          style={styles.image}
          source={{
            uri: role === Roles.ADMIN ? item.image : item.menuItem.image,
          }}
        />
        <Text style={[styles.rowCell, { width: "15%" }]}>{menuItemName}</Text>
        <Text style={[styles.rowCell, { width: "15%" }]}>
          {prices.map((price, i) =>
            i !== prices.length - 1
              ? price.size[0].toUpperCase() + "/"
              : price.size[0].toUpperCase()
          )}
        </Text>
        <Text style={[styles.rowCell, { flex: 1 }]}>{renderPrices}</Text>
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
          <View {...panResponder.panHandlers} style={{}}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                width: 50,
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="grip-lines" size={24} color="black" />
            </View>
          </View>
        )}
      </View>
    ),
    [index, draggingIdx, item]
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
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
