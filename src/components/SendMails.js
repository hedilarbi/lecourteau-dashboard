import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors, Fonts } from "../constants";

const SendMails = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Envoyer des e-mails</Text>
        <Text style={styles.subtitle}>
          Configurez vos campagnes email depuis cet espace.
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Bientôt disponible</Text>
        <Text style={styles.emptySubtitle}>
          Le module e-mails arrive prochainement.
        </Text>
      </View>
    </View>
  );
};

export default SendMails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 22,
    color: "#111827",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#111827",
  },
  emptySubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    textAlign: "center",
  },
});
