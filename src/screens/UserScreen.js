import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

import { Colors, Fonts } from "../constants";

import useGetUser from "../hooks/useGetUser";
import { convertDate } from "../utils/dateHandlers";
import { useRoute } from "@react-navigation/native";

const UserScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const { user, isLoading } = useGetUser(id);
  const setOrderColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#0A8D37";

      case "onGoing":
        return "#C28E09";
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.screenBg,
        }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.screenBg, padding: 8 }}
    >
      <View>
        <Text
          style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24, marginTop: 10 }}
        >
          General Info
        </Text>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            padding: 20,
            marginTop: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 / 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                  }}
                >
                  Name:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {user.name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                  }}
                >
                  email:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {user.email}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                  }}
                >
                  Phone Number:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {user.phone_number}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 / 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                  }}
                >
                  created At:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {convertDate(user.createdAt)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                  }}
                >
                  fidelity points:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {user.fidelity_points} points
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 20,
                  }}
                >
                  Number of orders:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {user.orders?.length} orders
                </Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 20,
              }}
            >
              Favoris:
            </Text>
            {user.favorites?.map((favorite) => (
              <Text>{favorite.name}, </Text>
            ))}
          </View>
        </View>
      </View>
      <View>
        <Text
          style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24, marginTop: 20 }}
        >
          Addresses
        </Text>

        {user.addresses?.length > 0 ? (
          <ScrollView style={{ marginTop: 20, backgroundColor: "white" }}>
            {user.addresses?.map((address, index) => (
              <View
                key={address._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Text style={[styles.rowCell]}>{address.city}</Text>
                <Text style={[styles.rowCell]}>{address.region}</Text>
                <Text style={[styles.rowCell]}>{address.street}</Text>
                <Text style={[styles.rowCell]}>{address.street_number}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text>Empty</Text>
          </View>
        )}
      </View>

      <View>
        <Text
          style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24, marginTop: 20 }}
        >
          Orders
        </Text>

        {user.orders?.length > 0 ? (
          <ScrollView
            style={{
              marginTop: 20,
              backgroundColor: "white",
            }}
          >
            {user.orders?.map((order, index) => (
              <View
                key={order._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Text style={[styles.rowCell, { width: "25%" }]}>
                  {convertDate(order.createdAt)}
                </Text>
                <Text style={[styles.rowCell, { width: "15%" }]}>
                  {order.status}
                </Text>
                <Text style={[styles.rowCell, { width: "15%" }]}>
                  {order.type}
                </Text>
                <Text style={[styles.rowCell, { width: "10%" }]}>
                  {order.total_price} $
                </Text>
                <Text style={[styles.rowCell, { width: "10  %" }]}>
                  {order.orderItems?.length +
                    order.offers?.length +
                    order.rewards?.length}{" "}
                  item(s)
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text>Empty</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    fontFamily: Fonts.LATO_BOLD,
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
