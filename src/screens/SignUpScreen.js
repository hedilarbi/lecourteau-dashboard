import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Colors, Fonts } from "../constants";
import FullLogo from "../../assets/icons/FullLogo.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {
  selectStaffToken,
  setStaffData,
  setStaffToken,
} from "../redux/slices/StaffSlice";
import * as SecureStore from "expo-secure-store";
import { loginStaff } from "../services/StaffServices";
import FailModel from "../components/models/FailModel";
import { verifySignUpForm } from "../utils/formValidators";
import { registerForPushNotificationsAsync } from "../services/NotifyServices";
const SignUpScreen = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorMsg, setShowErrorMessg] = useState(false);
  const [errorMsg, setErrorMessg] = useState("");
  const [expoToken, setExpoToken] = useState("");
  const userNameInput = useRef(null);
  const passwordInput = useRef(null);
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoToken(token.data);
    });
  }, []);

  const login = async () => {
    passwordInput.current.setNativeProps({
      style: {
        borderWidth: 0,
      },
    });
    userNameInput.current.setNativeProps({
      style: {
        borderWidth: 0,
      },
    });
    const { errors, valid } = verifySignUpForm(userName, password);
    if (!valid) {
      if (errors.username) {
        userNameInput.current.focus();
        userNameInput.current.setNativeProps({
          style: { borderColor: "red", borderWidth: 2 },
        });
        setErrorMessg(errors.username);
        setShowErrorMessg(true);

        return null;
      }
      if (errors.password) {
        passwordInput.current.focus();
        passwordInput.current.setNativeProps({
          style: { borderColor: "red", borderWidth: 2 },
        });
        setErrorMessg(errors.password);
        setShowErrorMessg(true);

        return null;
      }
    }
    setIsLoading(true);

    loginStaff(userName, password, expoToken)
      .then(async (response) => {
        console.log("aa");
        if (response.status) {
          dispatch(setStaffData(response.data));
          dispatch(setStaffToken(response.data.token));
          await SecureStore.setItemAsync("token", response.data.token);
        } else {
          setErrorMessg(response.message);
          setShowErrorMessg(true);
        }
      })
      .catch((err) => {})
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (showErrorMsg) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowErrorMessg(false);
      }, 3000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showErrorMsg]);

  return (
    <View style={{ flex: 1 }}>
      {showErrorMsg && <FailModel message={errorMsg} />}
      {isLoading && (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
        <View
          style={{
            height: "50%",
            backgroundColor: "black",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FullLogo />
        </View>
        <View
          style={{
            width: "40%",
            backgroundColor: "#EBEBEB",
            position: "absolute",
            alignSelf: "center",
            bottom: "40%",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 18 }}>
            Se connecter avec le nom d'utilisateur
          </Text>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              marginTop: 12,
              flexDirection: "row",
              paddingHorizontal: 8,
              paddingVertical: 2,
              alignItems: "center",
            }}
            ref={userNameInput}
          >
            <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 14 }}>
              Utilisateur:
            </Text>
            <TextInput
              placeholder="Utilisateur"
              placeholderTextColor="#CBC6C6"
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                flex: 1,
                fontSize: 14,
                marginLeft: 10,
              }}
              onChangeText={(text) => setUserName(text)}
            />
          </View>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              marginTop: 12,
              flexDirection: "row",
              paddingHorizontal: 8,
              paddingVertical: 2,
              alignItems: "center",
            }}
            ref={passwordInput}
          >
            <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 14 }}>
              Mot de passe:
            </Text>
            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor="#CBC6C6"
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                flex: 1,
                fontSize: 14,
                marginLeft: 10,
              }}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
          </View>

          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: Colors.primary,
              borderRadius: 5,
              paddingVertical: 8,
              alignItems: "center",
            }}
            onPress={login}
          >
            <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 14 }}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({});
