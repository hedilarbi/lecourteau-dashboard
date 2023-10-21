import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import UsersScreen from "../screens/UsersScreen";
import UserScreen from "../screens/UserScreen";

const UsersNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="User"
        component={UserScreen}
        options={{ title: "Utilisateur" }}
      />
    </Stack.Navigator>
  );
};

export default UsersNav;
