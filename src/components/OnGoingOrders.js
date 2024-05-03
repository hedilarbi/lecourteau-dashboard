import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors, Fonts } from "../constants";

const OnGoingOrders = ({ orders }) => {
  return (
    <View style={{ flex: 1, width: "100%" }}>
      <Text
        style={{
          fontFamily: Fonts.BEBAS_NEUE,
          fontSize: 22,
        }}
      >
        Commade en cours
      </Text>
      <ScrollView
        style={{
          flex: 1,
          marginTop: 12,
          elevation: 5,
          backgroundColor: Colors.screenBg,
        }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        {orders.length > 0 ? (
          orders.map((order, index) => {
            return (
              <View
                key={index}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? "rgba(247,166,0,0.3)" : "transparent",
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.LATO_REGULAR,
                    width: "40%",
                  }}
                  numberOfLines={1}
                >
                  {order.address}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.LATO_REGULAR,
                    width: "15%",
                  }}
                >
                  {order.code}
                </Text>
                <Text style={{ fontSize: 16, fontFamily: Fonts.LATO_REGULAR }}>
                  {order.type}
                </Text>
                <Text style={{ fontSize: 16, fontFamily: Fonts.LATO_REGULAR }}>
                  {order.total_price.toFixed(2)} $
                </Text>
              </View>
            );
          })
        ) : (
          <View
            style={{
              backgroundColor: "white",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: Fonts.LATO_BOLD }}>
              Pas de commandes en cours
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OnGoingOrders;

const styles = StyleSheet.create({});
