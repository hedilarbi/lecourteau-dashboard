import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import RootNavigation from "./src/navigators/RootNavigation";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import * as Device from "expo-device";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import "expo-dev-client";

SplashScreen.preventAutoHideAsync().catch(() => {});
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "BebasNeue-Regular": require("./assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),
    "Lato-Bold": require("./assets/fonts/Lato/Lato-Bold.ttf"),
    "Lato-Regular": require("./assets/fonts/Lato/Lato-Regular.ttf"),
    "Lato-Light": require("./assets/fonts/Lato/Lato-Light.ttf"),
  });

  const [iconFontsLoaded, setIconFontsLoaded] = useState(false);
  const [iconFontError, setIconFontError] = useState(null);

  const iconFontMap = useMemo(
    () => ({
      ...AntDesign.font,
      ...Entypo.font,
      ...Feather.font,
      ...FontAwesome.font,
      ...FontAwesome5.font,
      ...Fontisto.font,
      ...Ionicons.font,
      ...MaterialCommunityIcons.font,
      ...MaterialIcons.font,
      ...FontAwesome6.font,
    }),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const loadIconFonts = async () => {
      try {
        await Font.loadAsync(iconFontMap);
      } catch (error) {
        console.warn("Icon font load error:", error);
        if (isMounted) setIconFontError(error);
      } finally {
        if (isMounted) setIconFontsLoaded(true);
      }
    };

    loadIconFonts();
    return () => {
      isMounted = false;
    };
  }, [iconFontMap]);

  const appIsReady = (fontsLoaded || fontError) && iconFontsLoaded;
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const setScreenOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    );
  };

  useEffect(() => {
    setScreenOrientation();
  }, []);

  if (!appIsReady) {
    return null;
  }
  if (fontError || iconFontError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
            Font error: {String(fontError || iconFontError)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="light" backgroundColor="black" />
        <RootNavigation />
      </SafeAreaView>
    </Provider>
  );
}
