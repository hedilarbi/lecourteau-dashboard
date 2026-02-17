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
import { View } from "react-native";
import StaffNav from "./StaffNav";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import NotificationsScreen from "../screens/NotificationsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HomeNav from "./HomeNavigator";
import ToppingNav from "./ToppingNav";
function DrawerNavigator() {
  const { role } = useSelector(selectStaffData);
  const withIconMargin = (icon) => (
    <View style={{ marginRight: 8 }}>{icon}</View>
  );

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
        drawerStyle: {
          backgroundColor: Colors.dark,
          paddingVertical: 12,
          width: 300,
        },
        drawerActiveTintColor: Colors.primary,
        drawerActiveBackgroundColor: "rgba(247,166,0,0.14)",
        drawerInactiveTintColor: "#E5E7EB",
        drawerInactiveBackgroundColor: "transparent",
        drawerLabelStyle: {
          marginLeft: -12,
          fontFamily: Fonts.LATO_BOLD,
          fontSize: 16,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingVertical: 4,
        },
        drawerContentStyle: { paddingVertical: 0 },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="HomeNav"
        component={HomeNav}
        options={{
          headerShown: false,
          title: "Accueil",
          drawerIcon: ({ color }) => (
            withIconMargin(<FontAwesome name="home" size={24} color={color} />)
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
            withIconMargin(<FontAwesome name="users" size={24} color={color} />)
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
            withIconMargin(
              <Foundation name="clipboard-notes" size={28} color={color} />
            )
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
            withIconMargin(
              <SimpleLineIcons name="list" size={24} color={color} />
            )
          ),
        }}
      />
      <Drawer.Screen
        name="ToppingsNav"
        component={ToppingNav}
        options={{
          headerShown: false,
          title: "Personnalisations",
          drawerIcon: ({ color }) => (
            withIconMargin(
              <MaterialIcons
                name="dashboard-customize"
                size={24}
                color={color}
              />
            )
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
            withIconMargin(
              <MaterialCommunityIcons
                name="brightness-percent"
                size={24}
                color={color}
              />
            )
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
            withIconMargin(
              <Entypo name="price-ribbon" size={24} color={color} />
            )
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
            withIconMargin(
              <Fontisto name="persons" size={24} color={color} />
            )
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
            withIconMargin(
              <Ionicons name="restaurant" size={24} color={color} />
            )
          ),
        }}
      />
      <Drawer.Screen
        name="Paramètres"
        component={SettingsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            withIconMargin(<Ionicons name="settings" size={24} color={color} />)
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            withIconMargin(
              <Ionicons name="notifications" size={24} color={color} />
            )
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
