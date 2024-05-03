import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import { Colors, Fonts } from "../constants";
import CustomDrawer from "../components/CustomDrawer";
import {
  FontAwesome,
  SimpleLineIcons,
  Foundation,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import ToppingsScreen from "../screens/ToppingsScreen";
import OrdersNav from "./OrdersNav";
import ItemsNav from "./ItemsNav";
import OffersNav from "./OffersNav";
function CashierDrawer() {
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
