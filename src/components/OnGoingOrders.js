import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Colors, Fonts } from "../constants";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { confirmOrder } from "../services/OrdersServices";
import Spinner from "./Spinner";

const OnGoingOrders = ({ orders, setRefresh }) => {
  const navigation = useNavigation();
  const [confirming, setConfirming] = React.useState(false);

  const confirm = async (id) => {
    setConfirming(true);
    try {
      const response = await confirmOrder(id);

      if (response.status) {
        setRefresh((prev) => prev + 1);
      } else {
        console.log(response.message);
        Alert.alert("Une erreur s'est produite");
      }
    } catch (e) {
      Alert.alert("Une erreur s'est produite");
    } finally {
      setConfirming(false);
    }
  };
  return (
    <View style={{ flex: 1, width: "100%" }}>
      {confirming && <Spinner visibility={confirming} />}
      <Text
        style={{
          fontFamily: Fonts.BEBAS_NEUE,
          fontSize: 22,
        }}
      >
        Commandes en cours
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
                style={{
                  flexDirection: "row",

                  width: "100%",
                  backgroundColor:
                    index % 2 === 0 ? "rgba(247,166,0,0.3)" : "transparent",
                  justifyContent: "space-between",
                }}
                key={index}
              >
                <TouchableWithoutFeedback
                  style={{
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    gap: 10,
                    justifyContent: "space-between",
                    flex: 1,
                  }}
                  onPress={() =>
                    navigation.navigate("HomeNav", {
                      screen: "Order",
                      params: { id: order._id },
                    })
                  }
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
                  <Text
                    style={{ fontSize: 16, fontFamily: Fonts.LATO_REGULAR }}
                  >
                    {order.type === "delivery" ? "Livraison" : "Emporter"}
                  </Text>
                  <Text
                    style={{ fontSize: 16, fontFamily: Fonts.LATO_REGULAR }}
                  >
                    {order.total_price.toFixed(2)} $
                  </Text>
                </TouchableWithoutFeedback>
                {!order.confirmed && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "black",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 24,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: "white",
                    }}
                    onPress={() => confirm(order._id)}
                  >
                    <Text style={{ color: "white" }}>Confirmer</Text>
                  </TouchableOpacity>
                )}
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
