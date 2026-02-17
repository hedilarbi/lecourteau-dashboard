import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OrderScreen from "../screens/OrderScreen";

import HomeScreen from "../screens/HomeScreen";

const HomeNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Acceuil"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Order"
        component={OrderScreen}
        options={{ title: "Commande" }}
      />
    </Stack.Navigator>
  );
};

export default HomeNav;
