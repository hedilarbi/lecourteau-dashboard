import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OrderScreen from "../screens/OrderScreen";

import HomeScreen from "../screens/HomeScreen";
import TestPrinter from "../screens/TestPrinter";

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
      <Stack.Screen
        name="PrinterTest"
        component={TestPrinter}
        options={{ title: "Test d'impression" }}
      />
    </Stack.Navigator>
  );
};

export default HomeNav;
