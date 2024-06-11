import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

import { Colors, Fonts } from "../../constants";

import SuccessModel from "./SuccessModel";
import FailModel from "./FailModel";
import { createSize } from "../../services/SizesServices";

const CreateSizeModal = ({ setShowCreateSizeModel, setRefresh }) => {
  const [name, setName] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const nameRef = useRef(null);
  const saveItem = async () => {
    if (name.length < 1) {
      nameRef.current.setNativeProps({
        style: {
          borderWidth: 2,
          borderColor: "red",
        },
      });
      return;
    }
    setIsLoading(true);

    createSize(name)
      .then((response) => {
        if (response.status) {
          setRefresh((prev) => prev + 1);
          setShowSuccessModel(true);
        } else {
          setShowFailModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);

        setShowCreateSizeModel(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModal) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showFailModal]);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {showSuccessModel && <SuccessModel />}
        {showFailModal && (
          <FailModel message="Oops ! Quelque chose s'est mal passé" />
        )}
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
        <View style={styles.model}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
              Ajouter une taille
            </Text>
            <TouchableOpacity onPress={() => setShowCreateSizeModel(false)}>
              <AntDesign name="close" size={40} color="gray" />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.name}>
              <Text style={styles.text}>Nom</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingHorizontal: 5,
                  paddingVertical: 8,
                  width: "60%",
                  borderWidth: 2,

                  borderColor: Colors.primary,
                  marginLeft: 20,
                }}
                ref={nameRef}
                placeholder="Nom de la taille"
                placeholderTextColor={Colors.tgry}
                onChangeText={(text) => setName(text)}
              />
            </View>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 40,

              backgroundColor: Colors.primary,
              paddingHorizontal: 60,
              paddingVertical: 10,
              borderRadius: 5,
            }}
            onPress={saveItem}
          >
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Sauvegarder
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateSizeModal;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(50,44,44,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  model: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: 500,
  },

  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  name: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
  },
});
