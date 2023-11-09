import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Colors, Fonts } from "../constants";
import { sendNotifications } from "../services/NotifyServices";

const SendNotifications = ({
  setIsLoading,
  setShowSuccessModel,
  setShowFailModal,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const send = async () => {
    setIsLoading(true);
    sendNotifications(title, body)
      .then((response) => {
        if (response.status) {
          setTitle("");
          setBody("");
          setShowSuccessModel(true);
        } else {
          setShowFailModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
        Envoyer des notifications
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 50 }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>Titre</Text>
        <TextInput
          placeholder="Titre"
          style={{
            padding: 10,
            fontFamily: Fonts.LATO_LIGHT,
            fontSize: 20,
            flex: 1,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginLeft: 20,
          }}
          onChangeText={(text) => setTitle(text)}
        />
      </View>
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
            fontFamily: Fonts.LATO_LIGHT,
            fontSize: 20,
            flex: 1,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginLeft: 20,
          }}
          onChangeText={(text) => setTitle(text)}
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

export default SendNotifications;

const styles = StyleSheet.create({});
