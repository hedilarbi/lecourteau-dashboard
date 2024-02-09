import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Colors, Fonts } from "../constants";
import { sendSMS } from "../services/NotifyServices";
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
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
        Envoyer des SMS
      </Text>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 50 }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
          Message
        </Text>
        <TextInput
          placeholder="Message"
          style={{
            padding: 10,
            fontFamily: Fonts.LATO_REGULAR,
            fontSize: 20,
            flex: 1,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginLeft: 20,
          }}
          onChangeText={(text) => setBody(text)}
        />
      </View>
      <TouchableOpacity
        style={{
          marginTop: 80,
          alignSelf: "flex-end",
          backgroundColor: Colors.primary,
          paddingHorizontal: 60,
          paddingVertical: 10,
          borderRadius: 5,
        }}
        onPress={send}
      >
        <Text
          style={{
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 20,
          }}
        >
          Envoyer
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendSMS;

const styles = StyleSheet.create({});
