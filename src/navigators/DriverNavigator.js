import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Fontisto, FontAwesome } from "@expo/vector-icons";
import DriverScreen from "../screens/DriverScreen";
import DriverProfileNavigator from "./DriverProfileNavigator";

const DriverNavigator = () => {
  const MainTab = createBottomTabNavigator();

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
          component={DriverProfileNavigator}
          options={{ headerShown: false }}
        />
      </MainTab.Navigator>
    </>
  );
};

export default DriverNavigator;
