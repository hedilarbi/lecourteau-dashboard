import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import ItemsScreen from "../screens/ItemsScreen";
import ItemScreen from "../screens/ItemScreen";
import CategoriesScreen from "../screens/CategoriesScreen";

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
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "Categorie" }}
      />
    </Stack.Navigator>
  );
};

export default ItemsNav;
