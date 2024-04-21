import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { Colors, Fonts } from "../../constants";

const OrderDetailsModal = ({ setVisibility, visibility, order }) => {
  const { offers, user, orderItems, total_price } = order;

  return (
    <Modal
      animationType="slide"
      visible={visibility}
      transparent={true}
      onRequestClose={() => {
        setVisibility(false);
      }}
    >
      <View style={{ justifyContent: "flex-end", flex: 1 }}>
        <View
          style={{
            backgroundColor: "white",
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: "70%",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => setVisibility(false)}>
              <AntDesign name="close" size={36} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ marginTop: 6 }}>
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 18 }}>
              Details de la commande
            </Text>
            <View
              style={{
                marginTop: 18,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 16,
                  color: Colors.tgry,
                }}
              >
                Total de la commande:
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 16,
                  marginLeft: 12,
                  color: Colors.tgry,
                }}
              >
                {total_price.toFixed(2)} $
              </Text>
            </View>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 16,
                  color: Colors.tgry,
                }}
              >
                Nom du client:
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 18,
                  marginLeft: 12,
                  color: Colors.tgry,
                }}
              >
                {user.name}
              </Text>
            </View>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 16,
                  color: Colors.tgry,
                }}
              >
                Numero du client:
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 16,
                  marginLeft: 12,
                  color: Colors.tgry,
                }}
              >
                {user.phone_number}
              </Text>
            </View>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 16,
                  color: Colors.tgry,
                }}
              >
                Adresse du client:
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 18,
                  marginLeft: 12,
                  color: Colors.tgry,
                  flexWrap: "wrap",
                }}
              >
                {order.address}
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                height: 2,
                marginTop: 12,
                backgroundColor: Colors.primary,
              }}
            />
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 18,
                marginTop: 12,
              }}
            >
              Articles:
            </Text>
            {orderItems.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 16,
                    color: Colors.tgry,
                  }}
                >
                  {item.item.name} ({item.size})
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 16,
                    color: Colors.tgry,
                    marginLeft: 12,
                  }}
                >
                  {item.price.toFixed(2)} $
                </Text>
              </View>
            ))}
            <View
              style={{
                width: "100%",
                height: 2,
                marginTop: 12,
                backgroundColor: Colors.primary,
              }}
            />
            {offers.length > 0 && (
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 22,
                  marginTop: 12,
                }}
              >
                Offres:
              </Text>
            )}
            {offers.map((offer, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 18,
                    color: Colors.tgry,
                  }}
                >
                  {offer.offer.name}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.LATO_REGULAR,
                    fontSize: 18,
                    color: Colors.tgry,
                    marginLeft: 12,
                  }}
                >
                  {offer.price.toFixed(2)} $
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default OrderDetailsModal;

const styles = StyleSheet.create({});
