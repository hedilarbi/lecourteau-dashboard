import { createDrawerNavigator } from "@react-navigation/drawer";

import { Colors, Fonts } from "../constants";
import CustomDrawer from "../components/CustomDrawer";
import {
  FontAwesome,
  SimpleLineIcons,
  Foundation,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import ToppingsScreen from "../screens/ToppingsScreen";
import OrdersNav from "./OrdersNav";
import ItemsNav from "./ItemsNav";
import OffersNav from "./OffersNav";
import HomeNav from "./HomeNavigator";
import SettingsScreen from "../screens/SettingsScreen";
import ToppingNav from "./ToppingNav";
import { View } from "react-native";
function CashierDrawer() {
  const Drawer = createDrawerNavigator();
  const withIconMargin = (icon) => (
    <View style={{ marginRight: 8 }}>{icon}</View>
  );

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
          drawerIcon: ({ color }) =>
            withIconMargin(<FontAwesome name="home" size={24} color={color} />),
        }}
      />

      <Drawer.Screen
        name="OrdersNav"
        component={OrdersNav}
        options={{
          headerShown: false,
          title: "Commandes",
          drawerIcon: ({ color }) =>
            withIconMargin(
              <Foundation name="clipboard-notes" size={28} color={color} />,
            ),
        }}
      />
      <Drawer.Screen
        name="ItemsNav"
        component={ItemsNav}
        options={{
          headerShown: false,
          title: "Articles",
          drawerIcon: ({ color }) =>
            withIconMargin(
              <SimpleLineIcons name="list" size={24} color={color} />,
            ),
        }}
      />
      <Drawer.Screen
        name="ToppingsNav"
        component={ToppingNav}
        options={{
          headerShown: false,
          title: "Personalisations",
          drawerIcon: ({ color }) =>
            withIconMargin(
              <MaterialIcons
                name="dashboard-customize"
                size={24}
                color={color}
              />,
            ),
        }}
      />
      <Drawer.Screen
        name="OffersNav"
        component={OffersNav}
        options={{
          headerShown: false,
          title: "Offres",
          drawerIcon: ({ color }) =>
            withIconMargin(
              <MaterialCommunityIcons
                name="brightness-percent"
                size={24}
                color={color}
              />,
            ),
        }}
      />

      {/* <Drawer.Screen
        name="Paramètre"
        component={SettingsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color }) => (
            withIconMargin(<Ionicons name="settings" size={24} color={color} />)
          ),
        }}
      /> */}
      {/* <Drawer.Screen
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
