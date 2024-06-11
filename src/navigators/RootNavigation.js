import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpScreen from "../screens/SignUpScreen";
import * as Notifications from "expo-notifications";
import DrawerNavigator from "./DrawerNavigator";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import {
  clearStaff,
  selectStaffData,
  selectStaffToken,
  setStaffData,
  setStaffToken,
} from "../redux/slices/StaffSlice";
import { getStaffByToken } from "../services/StaffServices";
import { Roles } from "../constants";
import CashierDrawer from "./CashierDrawer";

import DriverNavigator from "./DriverNavigator";
import SkeletonScreen from "../screens/SkeletonScreen";

const RootNavigation = () => {
  const RootStack = createNativeStackNavigator();
  const staffToken = useSelector(selectStaffToken);
  const [isLoading, setIsLoading] = useState(true);
  const staff = useSelector(selectStaffData);

  const notificationListener = useRef();
  const responseListener = useRef();
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
          await deleteItemAsync("token");
          dispatch(setStaffData({}));
          dispatch(setStaffToken(null));
          setIsLoading(false);
        }
      } else {
        dispatch(clearStaff());
        setIsLoading(false);
      }
    } catch (error) {
      dispatch(clearStaff());
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStaffToken();
  }, [staffToken]);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
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
                    component={DriverNavigator} // Replace with your third component
                    options={{
                      headerShown: false,
                    }}
                  />
                );
              default:
                return (
                  <RootStack.Screen
                    name="Skeleton"
                    component={SkeletonScreen}
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
