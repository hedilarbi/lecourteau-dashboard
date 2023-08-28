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
import { Entypo } from "@expo/vector-icons";
import useGetOrder from "../../hooks/useGetOrder";
import { convertDate } from "../../utils/dateHandlers";

const OrderModel = ({ setShowOrderModel, id }) => {
  const { order, isLoading } = useGetOrder(id);

  const setOrderColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#0A8D37";

      case "Pending":
        return "#C28E09";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.model}>
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowOrderModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              position: "absolute",

              alignItems: "center",
              justifyContent: "center",
              zIndex: 100000,
            }}
          >
            <ActivityIndicator size={"large"} color="black" />
          </View>
        ) : (
          <>
            <View style={{}}>
              <View style={styles.infoContainer}>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={[styles.title]}>Status</Text>
                  <Text
                    style={[
                      styles.infoContent,
                      { color: setOrderColor(order.status) },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.title}>Client:</Text>
                  <Text style={styles.infoContent}>{order.user.name}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Total Price:</Text>
                  <Text style={styles.infoContent}>{order.total_price} $</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Sub Total Price:</Text>
                  <Text style={styles.infoContent}>{order.sub_total} $</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Delivery Fee:</Text>
                  <Text style={styles.infoContent}>{order.delivery_fee} $</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Instructions:</Text>
                  <Text style={styles.infoContent}>{order.instructions}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Type:</Text>
                  <Text style={styles.infoContent}>{order.type}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Address:</Text>
                  {/* <Text style={styles.infoContent}>{order.delivery_fee} $</Text> */}
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Created At:</Text>
                  <Text style={styles.infoContent}>
                    {convertDate(order.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
            <ScrollView style={{ marginTop: 50 }}>
              {order.orderItems?.map((item, index) => (
                <View
                  key={order._id}
                  style={[
                    styles.row,
                    index % 2
                      ? { backgroundColor: "transparent" }
                      : { backgroundColor: "rgba(247,166,0,0.3)" },
                  ]}
                >
                  <Text style={[styles.rowCell]}>{item.item.name}</Text>

                  <Text style={[styles.rowCell]}>{item.size}</Text>
                  <Text style={[styles.rowCell]}>{item.price} $</Text>

                  <View>
                    {item.customizations?.map((customization) => (
                      <Text style={styles.infoContent}>
                        {customization.name}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

export default OrderModel;

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
  infoContainer: {},
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
