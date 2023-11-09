import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import RestaurantsScreen from "../screens/RestaurantsScreen";
import RestaurantScreen from "../screens/RestaurantScreen";

const RestaurantsNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Restaurants"
        component={RestaurantsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={{
          title: "Réstaurant",
        }}
      />
    </Stack.Navigator>
  );
};

export default RestaurantsNav;
