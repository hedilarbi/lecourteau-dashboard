import React, { useMemo } from "react";
import { Colors, Fonts, Roles } from "../constants";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
const RenderMenuItem = ({
  item,
  index,
  role,
  handleShowMenuItemModel,
  handleShowDeleteWarning,
  updateAvailability,
  isUpdating,
  handleTri,
  triMode,
}) => {
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
      <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
        <Image
          style={styles.image}
          source={{
            uri: role === Roles.ADMIN ? item.image : item.menuItem.image,
          }}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {menuItemName}
          </Text>
          <View style={styles.tags}>
            {prices.map((price, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{price.size}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.priceList}>
          {prices.map((price, i) => (
            <Text key={i} style={styles.priceText}>
              {price.price.toFixed(2)} $
            </Text>
          ))}
        </View>
        {role === Roles.ADMIN ? (
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={() => handleShowMenuItemModel(item._id)}
          >
            <Ionicons name="pencil" size={18} color="#1D4ED8" />
          </TouchableOpacity>
        ) : (
          <View style={styles.availabilitySlot}>
            {isUpdating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Switch
                trackColor={{ false: "#767577", true: Colors.primary }}
                thumbColor="black"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => updateAvailability(item.menuItem._id)}
                value={item.availability}
              />
            )}
          </View>
        )}
        {role === Roles.ADMIN && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleShowDeleteWarning(item._id)}
          >
            <MaterialIcons name="delete-outline" size={20} color="#C43131" />
          </TouchableOpacity>
        )}
        {triMode && (
          <View style={styles.triButtons}>
            <TouchableOpacity
              style={styles.triButton}
              onPress={() => handleTri(index, index - 1)}
            >
              <Entypo
                name="chevron-with-circle-up"
                size={22}
                color="#1b1b1b"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.triButton}
              onPress={() => handleTri(index, index + 1)}
            >
              <Entypo
                name="chevron-with-circle-down"
                size={22}
                color="#1b1b1b"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      index,
      triMode,
      menuItemName,
      prices,
      role,
      item,
      handleShowMenuItemModel,
      handleShowDeleteWarning,
      updateAvailability,
      isUpdating,
      handleTri,
    ]
  );
};

export default RenderMenuItem;

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowAlt: {
    backgroundColor: "rgba(247,166,0,0.08)",
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: "cover",
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.screenBg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  tagText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 12,
    color: Colors.tgry,
  },
  priceList: {
    width: 90,
    gap: 4,
  },
  priceText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
    textAlign: "right",
  },
  availabilitySlot: {
    width: 52,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(29,78,216,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(29,78,216,0.25)",
  },
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
  triButtons: {
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  triButton: {
    padding: 4,
  },
});
