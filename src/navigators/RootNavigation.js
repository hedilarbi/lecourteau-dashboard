import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpScreen from "../screens/SignUpScreen";

import DrawerNavigator from "./DrawerNavigator";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import {
  selectStaffData,
  selectStaffToken,
  setStaffData,
  setStaffToken,
} from "../redux/slices/StaffSlice";
import { getStaffByToken } from "../services/StaffServices";
import { Roles } from "../constants";
import CashierDrawer from "./CashierDrawer";
import DriverScreen from "../screens/DriverScreen";

const RootNavigation = () => {
  const RootStack = createNativeStackNavigator();
  const staffToken = useSelector(selectStaffToken);
  const [isLoading, setIsLoading] = useState(true);
  const staff = useSelector(selectStaffData);
  const dispatch = useDispatch();

  const getStaffToken = async () => {
    setIsLoading(true);
    let token;
    try {
      token = await getItemAsync("token");

      if (token) {
        try {
          const response = await getStaffByToken(token);
          if (response.status && response.data) {
            dispatch(setStaffData(response.data));
            dispatch(setStaffToken(token));
          } else {
            await deleteItemAsync("token");
            dispatch(setStaffData({}));
            dispatch(setStaffToken(null));
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error getting staff data by token:", error);
          await deleteItemAsync("token");
          dispatch(setStaffData({}));
          dispatch(setStaffToken(null));
          setIsLoading(false);
        }
      } else {
        dispatch(setStaffData({}));
        dispatch(setStaffToken(null));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error getting token:", error);
      dispatch(setStaffData({}));
      dispatch(setStaffToken(null));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStaffToken();
  }, [staffToken]);
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {staffToken ? (
          (() => {
            switch (staff.role) {
              case Roles.ADMIN:
                return (
                  <RootStack.Screen
                    name="Main"
                    component={DrawerNavigator}
                    options={{
                      headerShown: false,
                    }}
                  />
                );
              case Roles.CASHIER:
                return (
                  <RootStack.Screen
                    name="Cashier"
                    component={CashierDrawer}
                    options={{
                      headerShown: false,
                    }}
                  />
                );
              case Roles.LIVREUR: // Replace with your third role
                return (
                  <RootStack.Screen
                    name="Driver" // Replace with your third component's name
                    component={DriverScreen} // Replace with your third component
                    options={{
                      headerShown: false,
                    }}
                  />
                );
              default:
                return (
                  <RootStack.Screen
                    name="Driver"
                    component={DriverScreen} // Replace with your default screen
                    options={{
                      headerShown: false,
                    }}
                  />
                );
            }
          })()
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
