import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItemAsync } from "expo-secure-store";
import { clearStaff, selectStaffData } from "../redux/slices/StaffSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const DriverProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const staff = useSelector(selectStaffData);
  const logout = async () => {
    try {
      await deleteItemAsync("token");
      dispatch(clearStaff());
    } catch (err) {}
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.screenBg }}>
      <View style={{ flex: 1, padding: 12 }}>
        <View
          style={{ backgroundColor: "white", borderRadius: 8, padding: 20 }}
        >
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                backgroundColor: Colors.primary,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                height: 35,
                width: 35,
              }}
            >
              <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 28 }}>
                {staff?.name[0]}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
                marginLeft: 9,
              }}
            >
              <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 18 }}>
                {staff?.name}
              </Text>
              <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 18 }}>
                {staff?.phone_number}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            justifyContent: "space-between",
            padding: 16,
            borderRadius: 12,
            flex: 1,
            marginTop: 12,
            backgroundColor: "white",
          }}
        >
          <View>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => navigation.navigate("DriverOrders")}
            >
              <AntDesign name="book" size={22} color="black" />
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 18,
                  marginLeft: 12,
                }}
              >
                Mes commandes
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={logout}
            >
              <MaterialCommunityIcons name="logout" size={22} color="black" />
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 18,
                  marginLeft: 12,
                }}
              >
                Deconnexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DriverProfileScreen;

const styles = StyleSheet.create({});
