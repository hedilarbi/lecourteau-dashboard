import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import FullLogo from "../../assets/icons/FullLogo.svg";
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
    <View style={styles.container}>
      <View style={styles.branding}>
        <View style={styles.logoWrap}>
          <FullLogo width={140} height={34} />
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.menuCard}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <TouchableOpacity
        style={styles.logout}
        onPress={logout}
        activeOpacity={0.85}
      >
        <Entypo name="log-out" size={24} color={Colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.logoutLabel}>Déconnexion</Text>
          <Text style={styles.logoutSub}>Quitter la session</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  branding: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  logoWrap: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  brandSubtitle: {
    marginTop: 8,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#E5E7EB",
  },
  scrollContent: {
    paddingVertical: 8,
  },
  menuCard: {
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  menuTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#E5E7EB",
    opacity: 0.9,
    marginBottom: 4,
  },
  logout: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "#111827",
  },
  logoutLabel: {
    fontFamily: Fonts.LATO_BOLD,
    color: Colors.primary,
    fontSize: 15,
  },
  logoutSub: {
    fontFamily: Fonts.LATO_REGULAR,
    color: "#9CA3AF",
    fontSize: 12,
  },
});
