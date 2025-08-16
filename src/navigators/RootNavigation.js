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
import { Colors, Roles } from "../constants";
import CashierDrawer from "./CashierDrawer";

import DriverNavigator from "./DriverNavigator";
import SkeletonScreen from "../screens/SkeletonScreen";
import {
  selectGlobalRefresh,
  setGlobalRefresh,
} from "../redux/slices/globalRefreshSlice";
import { API_URL } from "@env";
import axios from "axios";
import {
  Alert,
  Dimensions,
  Text,
  Touchable,
  Vibration,
  View,
} from "react-native";
import { Audio } from "expo-av";
import { TouchableOpacity } from "react-native";
const ONE_SECOND_IN_MS = 1000;

const PATTERN = [
  0 * ONE_SECOND_IN_MS,
  2 * ONE_SECOND_IN_MS,
  1 * ONE_SECOND_IN_MS,
  2 * ONE_SECOND_IN_MS,
  1 * ONE_SECOND_IN_MS,
  2 * ONE_SECOND_IN_MS,
];
const RootNavigation = () => {
  const RootStack = createNativeStackNavigator();
  const staffToken = useSelector(selectStaffToken);
  const [isLoading, setIsLoading] = useState(true);
  const staff = useSelector(selectStaffData);
  const height = Dimensions.get("window").height;
  const globalRefresh = useSelector(selectGlobalRefresh);
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);

  const notificationListener = useRef();
  const responseListener = useRef();
  const dispatch = useDispatch();
  const soundRef = useRef(null); // Ref to store the sound object

  const playNotificationSoundInLoop = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/notificationsound.wav")
    );
    sound.setIsLoopingAsync(true); // Enable looping
    Vibration.vibrate(PATTERN, true); // Enable vibration in a loop
    await sound.playAsync();
    soundRef.current = sound; // Store the sound object in the ref
  };

  const handleClosingAlert = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync(); // Stop the sound
      await soundRef.current.unloadAsync(); // Unload the sound to free resources
      soundRef.current = null; // Reset the ref
    }
    Vibration.cancel(); // Stop the vibration
    setShowNewOrderAlert(false); // Set the alert to false
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!staff.restaurant) return;
        if (showNewOrderAlert) return; // Skip if the alert is already shown

        const response = await axios.get(
          `${API_URL}/orders/nonConfirmed/${staff.restaurant}`
        );

        const orders = response.data;

        if (orders.length > 0) {
          await playNotificationSoundInLoop(); // Play sound in a loop
          setShowNewOrderAlert(true); // Show the alert
          dispatch(setGlobalRefresh());
        }
      } catch (error) {
        console.error("Error fetching new orders:", error);
      }
    };

    const interval = setInterval(fetchOrders, 60000); // Check every 60 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [staff.restaurant, showNewOrderAlert]);

  useEffect(() => {
    return () => {
      // Cleanup sound on component unmount
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
      Vibration.cancel();
    };
  }, []);

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

        dispatch(setGlobalRefresh());
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        dispatch(setGlobalRefresh());
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
      {showNewOrderAlert && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            width: "100%",
            height: height,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "60%",
                height: "50%",
                backgroundColor: "white",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 100,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                Nouvelle commande non confirme
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  marginTop: 32,
                }}
                onPress={handleClosingAlert}
              >
                <Text
                  style={{ color: "black", fontSize: 18, fontWeight: "bold" }}
                >
                  Bien reçu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
