import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OffersScreen from "../screens/OffersScreen";
import OfferScreen from "../screens/OfferScreen";

const OffersNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Offer"
        component={OfferScreen}
        options={{ title: "Offre" }}
      />
    </Stack.Navigator>
  );
};

export default OffersNav;
