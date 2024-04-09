import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useDispatch } from "react-redux";
import { deleteItemAsync } from "expo-secure-store";
import { clearStaff } from "../redux/slices/StaffSlice";
const DriverProfileScreen = () => {
  const dispatch = useDispatch();
  const logout = async () => {
    try {
      await deleteItemAsync("token");
      dispatch(clearStaff());
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <View>
      <Button title="Déconnexion" onPress={logout} />
    </View>
  );
};

export default DriverProfileScreen;

const styles = StyleSheet.create({});
