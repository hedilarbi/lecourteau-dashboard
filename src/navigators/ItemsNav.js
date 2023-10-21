import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OrderScreen from "../screens/OrderScreen";
import ItemsScreen from "../screens/ItemsScreen";
import ItemScreen from "../screens/ItemScreen";

const ItemsNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Items"
        component={ItemsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Item"
        component={ItemScreen}
        options={{ title: "Article" }}
      />
    </Stack.Navigator>
  );
};

export default ItemsNav;
