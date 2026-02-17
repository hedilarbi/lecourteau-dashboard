import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ItemScreen from "../screens/ItemScreen";
import CategoriesScreen from "../screens/CategoriesScreen";

import ToppingsScreen from "../screens/ToppingsScreen";
import ToppingGroupsScreen from "../screens/ToppingGroupsScreen";
import ToppingGroupScreen from "../screens/ToppingGroupScreen";

const ToppingNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Toppings"
        component={ToppingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ToppingGroups"
        component={ToppingGroupsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ToppingGroup"
        component={ToppingGroupScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ToppingNav;
