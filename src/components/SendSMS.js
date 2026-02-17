import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Colors, Fonts } from "../constants";
import axios from "axios";
import { API_URL } from "@env";

const SendSMS = ({ setIsLoading, setShowSuccessModel, setShowFailModal }) => {
  const [body, setBody] = useState("");

  const send = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/notifiers/sms`, {
        body,
      });
      if (response.status === 200) {
        setBody("");
        setShowSuccessModel(true);
      }
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Envoyer des SMS</Text>
        <Text style={styles.subtitle}>
          Rédigez un message court et percutant.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          placeholder="Message"
          style={[styles.input, styles.textArea]}
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setBody(text)}
          value={body}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={send}>
        <Text style={styles.sendLabel}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendSMS;

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
  field: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    backgroundColor: Colors.gry,
    color: "#111827",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sendLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
});
