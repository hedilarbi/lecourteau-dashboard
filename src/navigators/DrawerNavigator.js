import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";

import { Colors, Fonts } from "../constants";
import CustomDrawer from "../components/CustomDrawer";
import {
  FontAwesome,
  SimpleLineIcons,
  Foundation,
  MaterialCommunityIcons,
  Ionicons,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";

import RewardsScreen from "../screens/RewardsScreen";
import ToppingsScreen from "../screens/ToppingsScreen";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import UsersNav from "./UsersNav";
import OrdersNav from "./OrdersNav";
import ItemsNav from "./ItemsNav";

import OffersNav from "./OffersNav";

function DrawerNavigator() {
  const Drawer = createDrawerNavigator();
  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }

    setOrientation();

    return () => {
      async function unlockOrientation() {
        await ScreenOrientation.unlockAsync();
      }
      unlockOrientation();
    };
  }, []);
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
        name="Acceuil"
        component={HomeScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="UsersNav"
        component={UsersNav}
        options={{
          headerShown: false,
          title: "Utilisateur",
          drawerIcon: ({ color }) => (
            <FontAwesome name="users" size={24} color={color} />
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
      <Drawer.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          title: "Récompenses",
          headerShown: false,
          drawerIcon: ({ color }) => (
            <Entypo name="price-ribbon" size={24} color={color} />
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

export default DrawerNavigator;
