import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Fontisto, FontAwesome } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

import DriverScreen from "../screens/DriverScreen";
import DriverProfileScreen from "../screens/DriverProfileScreen";

const DriverNavigator = () => {
  const MainTab = createBottomTabNavigator();

  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const navigation = useNavigation();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);

        const data = notification.request.content.data;

        // if (data && data.order_id) {
        //   navigation.navigate("ProfileNav", {
        //     screen: "Details",
        //     params: { id: data.order_id },
        //   });
        // }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data && data.order_id) {
          // If notification contains an orderId, navigate to OrderDetailsScreen
          navigation.navigate("ProfileNav", {
            screen: "Details",
            params: { id: data.order_id },
          });
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <>
      <MainTab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName;
            switch (route.name) {
              case "Map":
                iconName = focused ? (
                  <Fontisto name="map" size={28} color="#F7A600" />
                ) : (
                  <Fontisto name="map" size={28} color="#827B7B" />
                );
                break;
              case "Profile":
                iconName = focused ? (
                  <FontAwesome name="user" size={28} color="#F7A600" />
                ) : (
                  <FontAwesome name="user" size={28} color="#827B7B" />
                );
                break;
            }

            return iconName;
          },
          tabBarActiveTintColor: "#F7A600",
          tabBarInactiveTintColor: "#827B7B",
          tabBarLabelStyle: {
            fontFamily: "BebasNeue-Regular",
          },
        })}
      >
        <MainTab.Screen
          name="Map"
          component={DriverScreen}
          options={{ headerShown: false }}
        />
        <MainTab.Screen
          name="Profile"
          component={DriverProfileScreen}
          options={{ headerShown: false }}
        />
      </MainTab.Navigator>
    </>
  );
};

export default DriverNavigator;
