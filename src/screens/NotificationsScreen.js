import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Choisissez le canal et envoyez des messages ciblés.
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Push</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>SMS</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>E-mail</Text>
            </View>
          </View>
        </View>

        <View style={styles.layout}>
          <View style={styles.navCard}>
            {[
              { key: "notifications", label: "Notifications" },
              { key: "sms", label: "SMS" },
              { key: "emails", label: "E-mails" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.navButton,
                  activePage === tab.key && styles.navButtonActive,
                ]}
                onPress={() => setActivePage(tab.key)}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.navLabel,
                    activePage === tab.key && styles.navLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.panel}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
    gap: 10,
  },
  headerText: {
    gap: 4,
  },
  title: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 34,
    color: "#1b1b1b",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: Colors.tgry,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(247,166,0,0.14)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 12,
    color: "#1b1b1b",
  },
  layout: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  navCard: {
    minWidth: 200,
    backgroundColor: Colors.gry,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "white",
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: Colors.tgry,
  },
  navLabelActive: {
    color: "#1b1b1b",
  },
  panel: {
    flex: 1,
    minHeight: 300,
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
});
