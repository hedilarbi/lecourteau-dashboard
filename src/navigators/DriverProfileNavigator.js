import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import DriverOrdersList from "../screens/DriverOrdersList";
import DriverOrderDetails from "../screens/DriverOrderDetails";
import DriverProfileScreen from "../screens/DriverProfileScreen";

const DriverProfileNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={DriverProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverOrders"
        component={DriverOrdersList}
        options={{ title: "Mes Commandes" }}
      />
      <Stack.Screen
        name="DriverOrder"
        component={DriverOrderDetails}
        options={{ title: "Details" }}
      />
    </Stack.Navigator>
  );
};

export default DriverProfileNavigator;
