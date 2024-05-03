import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants";
const StaffCard = ({ name }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
        elevation: 5,

        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "white",
      }}
    >
      <View>
        <FontAwesome name="user" size={38} color={Colors.primary} />
      </View>
      <View>
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 18 }}>
          Bonjour
        </Text>
        <Text
          style={{
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 16,
            color: Colors.tgry,
            marginTop: 5,
          }}
        >
          {name}
        </Text>
      </View>
    </View>
  );
};

export default StaffCard;

const styles = StyleSheet.create({});
