import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";

import { Colors, Fonts, Roles } from "../constants";
import CustomDrawer from "../components/CustomDrawer";
import {
  FontAwesome,
  SimpleLineIcons,
  Foundation,
  MaterialCommunityIcons,
  Entypo,
  MaterialIcons,
  Ionicons,
  Fontisto,
} from "@expo/vector-icons";

import RewardsScreen from "../screens/RewardsScreen";
import ToppingsScreen from "../screens/ToppingsScreen";
import * as Location from "expo-location";
import UsersNav from "./UsersNav";
import OrdersNav from "./OrdersNav";
import ItemsNav from "./ItemsNav";

import OffersNav from "./OffersNav";
import RestaurantsNav from "./RestaurantsNav";
import { useEffect, useRef } from "react";
import StaffNav from "./StaffNav";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
function CashierDrawer() {
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;

        if (data && data.order_id) {
          navigation.navigate("OrderNav", {
            screen: "Order",
            params: { id: data.order_id },
          });
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data && data.order_id) {
          navigation.navigate("Cashier", {
            screen: "OrderNav ",
            params: { id: data.order_id },
          });
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: "permanent",
        drawerStyle: { backgroundColor: "black", padding: 0, margin: 0 },
        drawerActiveTintColor: "black",
        drawerActiveBackgroundColor: Colors.primary,
        drawerInactiveTintColor: Colors.primary,
        drawerInactiveBackgroundColor: "black",
        drawerLabelStyle: {
          marginLeft: -20,
          fontFamily: Fonts.BEBAS_NEUE,
          fontSize: 24,
        },
        drawerItemStyle: {
          borderRadius: 0,
          margin: 0,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="OrdersNav"
        component={OrdersNav}
        options={{
          headerShown: false,
          title: "Commandes",
          drawerIcon: ({ color }) => (
            <Foundation name="clipboard-notes" size={28} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ItemsNav"
        component={ItemsNav}
        options={{
          headerShown: false,
          title: "Articles",
          drawerIcon: ({ color }) => (
            <SimpleLineIcons name="list" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Toppings"
        component={ToppingsScreen}
        options={{
          headerShown: false,
          title: "Personalisations",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="dashboard-customize" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="OffersNav"
        component={OffersNav}
        options={{
          headerShown: false,
          title: "Offres",
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="brightness-percent"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* <Drawer.Screen
        name="Paramètre"
        component={SettingsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            <Ionicons name="notifications" size={24} color={color} />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
}

export default CashierDrawer;
