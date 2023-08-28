import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OrderScreen from "../screens/OrderScreen";
import OrdersScreen from "../screens/OrdersScreen";

const OrdersNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="Order" component={OrderScreen} />
    </Stack.Navigator>
  );
};

export default OrdersNav;
