import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Colors, Fonts, Roles } from "../constants";

const MenuItemsFilter = ({
  categories,
  menuItemFilter,
  setMenuItemFilter,
  menuItemsList,
  setMenuItems,
  role,
}) => {
  const handleMenuItemFiltering = (categoryName) => {
    if (categoryName !== "Toutes les catégories") {
      let list = null;
      if (role === Roles.ADMIN) {
        list = menuItemsList.filter(
          (item) => item.category.name === categoryName
        );
      } else {
        list = menuItemsList.filter(
          (item) => item.menuItem.category.name === categoryName
        );
      }

      setMenuItems(list);
      setMenuItemFilter(categoryName);
    } else {
      setMenuItems(menuItemsList);
      setMenuItemFilter(categoryName);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
      }}
    >
      <TouchableOpacity
        style={
          menuItemFilter === "Toutes les catégories"
            ? {
                backgroundColor: "black",
                borderRadius: 20,
                paddingVertical: 8,
              }
            : {
                backgroundColor: "transparent",
                borderRadius: 20,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "black",
              }
        }
        onPress={() => handleMenuItemFiltering("Toutes les catégories")}
      >
        <Text
          style={
            menuItemFilter === "Toutes les catégories"
              ? {
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 18,
                  color: Colors.primary,
                  paddingHorizontal: 12,
                }
              : {
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 18,
                  color: "black",
                  paddingHorizontal: 12,
                }
          }
        >
          toutes les catégories
        </Text>
      </TouchableOpacity>
      {categories.map((item) => (
        <TouchableOpacity
          key={item._id}
          style={
            menuItemFilter === item.name
              ? {
                  backgroundColor: "black",
                  borderRadius: 20,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }
              : {
                  backgroundColor: "transparent",
                  borderRadius: 20,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: "black",
                  borderWidth: 1,
                }
          }
          onPress={() => handleMenuItemFiltering(item.name)}
        >
          <Text
            style={
              menuItemFilter === item.name
                ? {
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 18,
                    color: Colors.primary,
                    paddingHorizontal: 12,
                  }
                : {
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 18,
                    color: "black",
                    paddingHorizontal: 12,
                  }
            }
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default MenuItemsFilter;

const styles = StyleSheet.create({});
