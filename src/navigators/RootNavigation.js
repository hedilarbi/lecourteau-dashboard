import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpScreen from "../screens/SignUpScreen";

import DrawerNavigator from "./DrawerNavigator";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { getItemAsync } from "expo-secure-store";
import { selectStaffToken, setStaffToken } from "../redux/slices/StaffSlice";

const RootNavigation = () => {
  const RootStack = createNativeStackNavigator();

  const staffToken = useSelector(selectStaffToken);
  const dispatch = useDispatch();

  const getUserToken = async () => {
    let staffToken;
    try {
      staffToken = await getItemAsync("token");
    } catch (err) {
      console.log(err.message);
    }
    dispatch(setStaffToken(staffToken));
  };

  useEffect(() => {
    getUserToken();
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {staffToken ? (
          <RootStack.Screen
            name="Main"
            component={DrawerNavigator}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <RootStack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
