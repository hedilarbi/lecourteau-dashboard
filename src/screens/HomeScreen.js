import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { getInitialStats } from "../services/statsServices";
import { Colors, Fonts } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [usersCount, setUsersCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [onGoingOrdersCount, setOnGoingOrdersCount] = useState(null);

  const loadHome = async () => {
    setIsLoading(true);
    getInitialStats()
      .then((response) => {
        if (response.status) {
          setOnGoingOrdersCount(response.data.onGoingOrdersCount);
          setOrdersCount(response.data.ordersCount);
          setUsersCount(response.data.usersCount);
        } else {
          Alert.alert(response.message);
        }
      })
      .catch((err) => {
        Alert.alert("Problème de connexion");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [])
  );
  useEffect(() => {
    loadHome();
  }, [refresh]);
  return (
    <View style={{ padding: 24, flex: 1 }}>
      <TouchableOpacity
        style={{
          alignSelf: "flex-end",
          padding: 8,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.primary,
        }}
        onPress={() => setRefresh(refresh + 1)}
      >
        <Ionicons name="refresh" size={48} color="black" />
      </TouchableOpacity>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            marginTop: 40,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.primary,
              flex: 1 / 3,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 28 }}>
              Nombre d'utilisateurs: {usersCount}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: Colors.primary,
              flex: 1 / 3,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 28 }}>
              Commandes en cours: {onGoingOrdersCount?.on_going}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: Colors.primary,
              flex: 1 / 3,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 28 }}>
              Toutes les commandes: {ordersCount}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
