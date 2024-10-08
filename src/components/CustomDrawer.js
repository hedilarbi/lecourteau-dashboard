import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import FullLogo from "../../assets/icons/FullLogo.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Entypo } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";
import { deleteItemAsync } from "expo-secure-store";
import { useDispatch } from "react-redux";
import { clearStaff } from "../redux/slices/StaffSlice";
const CustomDrawer = (props) => {
  const dispatch = useDispatch();
  const logout = async () => {
    try {
      await deleteItemAsync("token");
      dispatch(clearStaff());
    } catch (err) {}
  };
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "black",
        }}
      >
        <FullLogo />
      </View>

      <DrawerContentScrollView {...props}>
        <View
          style={{
            padding: 0,
            margin: 0,
            flex: 1,
            borderRadius: 0,
            backgroundColor: "#2E2E2E",
          }}
        >
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          paddingVertical: 20,
          paddingLeft: 20,
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Entypo name="log-out" size={24} color={Colors.primary} />
        <Text
          style={{
            fontFamily: Fonts.BEBAS_NEUE,
            color: Colors.primary,
            fontSize: 24,
            marginLeft: 10,
          }}
          onPress={logout}
        >
          Déconnexion
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({});
