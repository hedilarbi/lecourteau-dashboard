import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import ItemsScreen from "../screens/ItemsScreen";
import ItemScreen from "../screens/ItemScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SizesScreen from "../screens/SizesScreen";
import SizesGroupeScreen from "../screens/SizesGroupeScreen";

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
        options={{ title: "Article", headerShown: false }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "Categorie", headerShown: false }}
      />
      <Stack.Screen
        name="Sizes"
        component={SizesScreen}
        options={{ title: "Tailles", headerShown: false }}
      />
      <Stack.Screen
        name="SizeGroups"
        component={SizesGroupeScreen}
        options={{ title: "Groupes de tailles", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ItemsNav;
