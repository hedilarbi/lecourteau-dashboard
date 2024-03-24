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
import { useEffect } from "react";
import StaffNav from "./StaffNav";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import NotificationsScreen from "../screens/NotificationsScreen";
import SettingsScreen from "../screens/SettingsScreen";
function DrawerNavigator() {
  const { role } = useSelector(selectStaffData);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
    })();
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
          title: "Acceuil",
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
          title: "Utilisateurs",
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
          title: "Personnalisations",
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
      <Drawer.Screen
        name="StaffNav"
        component={StaffNav}
        options={{
          title: "Employés",
          headerShown: false,
          drawerIcon: ({ color }) => (
            <Fontisto name="persons" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="RestaurantsNav"
        component={RestaurantsNav}
        options={{
          title: "Restaurants",
          headerShown: false,
          drawerIcon: ({ color }) => (
            <Ionicons name="restaurant" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Paramètres"
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
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
