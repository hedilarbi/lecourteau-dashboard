import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";

import useGetUser from "../../hooks/useGetUser";
import { convertDate } from "../../utils/dateHandlers";

const UserModel = ({ setShowUserModel, id }) => {
  const { user, isLoading } = useGetUser(id);

  const setOrderColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#0A8D37";

      case "onGoing":
        return "#C28E09";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.model}>
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowUserModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>
        {isLoading ? (
          <View
            style={{
              flex: 1,

              width: "100%",

              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size={"large"} color="black" />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image style={styles.image} source={{ uri: user.profile_img }} />
              <View style={styles.infoContainer}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.title}>Name</Text>
                  <Text style={styles.infoContent}>{user.name}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Email</Text>
                  <Text style={styles.infoContent}>{user.email}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Phone Number</Text>
                  <Text style={styles.infoContent}>{user.phone_number}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Points</Text>
                  <Text style={styles.infoContent}>{user.points}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>created At</Text>
                  <Text style={styles.infoContent}>
                    {convertDate(user.createdAt)}
                  </Text>
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.title}>number of orders</Text>
                  <Text style={styles.infoContent}>{user.orders?.length}</Text>
                </View>
              </View>
            </View>
            <ScrollView style={{ marginTop: 50 }}>
              {user.orders?.map((order, index) => (
                <View
                  key={index}
                  style={[
                    styles.row,
                    index % 2
                      ? { backgroundColor: "transparent" }
                      : { backgroundColor: "rgba(247,166,0,0.3)" },
                  ]}
                >
                  <Text style={[styles.rowCell]}>
                    {convertDate(order.createdAt)}
                  </Text>
                  <Text
                    style={[
                      styles.rowCell,
                      { flex: 1, color: setOrderColor(order.status) },
                    ]}
                  >
                    {order.status}
                  </Text>
                  <Text style={[styles.rowCell]}>{order.total_price} $</Text>
                  <Text style={[styles.rowCell]}>{order.address}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

export default UserModel;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(50,44,44,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  model: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "70%",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: "cover",
  },
  infoContainer: {
    marginLeft: 40,
  },
  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontFamily: Fonts.LATO_REGULAR, fontSize: 20 },
  infoContent: { fontFamily: Fonts.LATO_REGULAR, fontSize: 16, marginLeft: 20 },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
