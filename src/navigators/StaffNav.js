import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import StaffsScreen from "../screens/StaffsScreen";
import EmployeeScreen from "../screens/EmployeeScreen";

const StaffNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Staff"
        component={StaffsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Employee"
        component={EmployeeScreen}
        options={{
          title: "Employée",
        }}
      />
    </Stack.Navigator>
  );
};

export default StaffNav;
