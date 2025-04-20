import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants";
import SendNotifications from "../components/SendNotifications";
import SuccessModel from "../components/models/SuccessModel";
import FailModel from "../components/models/FailModel";
import SendSMS from "../components/SendSMS";
import SendMails from "../components/SendMails";

const NotificationsScreen = () => {
  const [activePage, setActivePage] = useState("notifications");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  useEffect(() => {
    if (showFailModal) {
      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModal]);
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  return (
    <SafeAreaView style={styles.screen}>
      {isLoading && (
        <View
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            width: "100%",
            height: "100%",
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <ActivityIndicator size={"large"} color="black" />
        </View>
      )}
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <View style={styles.container}>
        <View style={styles.btns_container}>
          <TouchableOpacity
            style={
              activePage === "notifications"
                ? styles.active_nav_btns
                : styles.inactive_nav_btns
            }
            onPress={() => setActivePage("notifications")}
          >
            <Text style={styles.nav_btns_txt}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activePage === "sms"
                ? styles.active_nav_btns
                : styles.inactive_nav_btns
            }
            onPress={() => setActivePage("sms")}
          >
            <Text style={styles.nav_btns_txt}>SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activePage === "emails"
                ? styles.active_nav_btns
                : styles.inactive_nav_btns
            }
            onPress={() => setActivePage("emails")}
          >
            <Text style={styles.nav_btns_txt}>E-Mails</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.main_container}>
          {activePage === "notifications" && (
            <SendNotifications
              setIsLoading={setIsLoading}
              setShowFailModal={setShowFailModal}
              setShowSuccessModel={setShowSuccessModel}
            />
          )}
          {activePage === "sms" && (
            <SendSMS
              setIsLoading={setIsLoading}
              setShowFailModal={setShowFailModal}
              setShowSuccessModel={setShowSuccessModel}
            />
          )}
          {activePage === "emails" && (
            <SendMails
              setIsLoading={setIsLoading}
              setShowFailModal={setShowFailModal}
              setShowSuccessModel={setShowSuccessModel}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
    justifyContent: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,

    marginHorizontal: 40,
  },
  btns_container: {
    height: "60%",

    justifyContent: "space-between",
  },
  active_nav_btns: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  inactive_nav_btns: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  nav_btns_txt: { fontFamily: Fonts.LATO_BOLD, fontSize: 24 },
  main_container: {
    backgroundColor: "white",
    borderRadius: 12,

    flex: 1,
    marginLeft: 20,
    marginVertical: 40,
  },
});
