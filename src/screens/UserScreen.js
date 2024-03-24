import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";

import { Colors, Fonts } from "../constants";

import useGetUser from "../hooks/useGetUser";
import { convertDate } from "../utils/dateHandlers";
import { useRoute } from "@react-navigation/native";

import ErrorScreen from "../components/ErrorScreen";

const UserScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const { user, isLoading, error, setRefresh } = useGetUser(id);

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

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.screenBg, padding: 16 }}
    >
      <View>
        <Text
          style={{
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 24,
            marginVertical: 10,
          }}
        >
          Informations Générale
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
                  Nom & prénom:
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
                  E-mail:
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
                  Téléphone:
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
                  Creé le:
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
                  Points de fidélités:
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
                  Nombre de commande:
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {user.orders?.length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View>
        <Text
          style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24, marginTop: 20 }}
        >
          Adresses
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
                <Text
                  style={{
                    flex: 1,
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 20,
                  }}
                >
                  {address.address}
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
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Vide
            </Text>
          </View>
        )}
      </View>

      <View>
        <Text
          style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24, marginTop: 20 }}
        >
          Commandes
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
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
              Vide
            </Text>
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
