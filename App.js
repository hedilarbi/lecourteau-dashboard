import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";

import RootNavigation from "./src/navigators/RootNavigation";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import * as Device from "expo-device";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";
import "expo-dev-client";

SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    "BebasNeue-Regular": require("./assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),

    "Lato-Bold": require("./assets/fonts/Lato/Lato-Bold.ttf"),
    "Lato-Regular": require("./assets/fonts/Lato/Lato-Regular.ttf"),
    "Lato-Light": require("./assets/fonts/Lato/Lato-Light.ttf"),
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }

    hideSplashScreen();
  }, [fontsLoaded]);

  useEffect(() => {
    if (Device.deviceType === 2) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="black" />
        <RootNavigation />
      </SafeAreaView>
    </Provider>
  );
}
