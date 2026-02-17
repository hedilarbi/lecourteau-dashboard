import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Fonts } from "../../constants";
import SuccessModel from "./SuccessModel";
import FailModel from "./FailModel";

const DeleteWarning = ({
  id,
  setDeleteWarningModelState,
  setRefresh,

  message,
  deleter,
}) => {
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const deleteFromList = async (id) => {
    setIsLoading(true);
    try {
      const deleteResponse = await deleter(id);

      setIsLoading(false);
      if (deleteResponse.status) {
        setShowSuccessModel(true);
      } else {
        setShowFailModal(true);
      }
    } catch (error) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setDeleteWarningModelState(false);
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
    <View style={styles.container}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size={"large"} color="black" />
        </View>
      )}
      <View style={styles.model}>
        <View style={styles.titleContainer}>
          <AntDesign name="exclamationcircle" size={65} color="#FF0707" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Alerte</Text>
            <Text style={styles.subTitle}>{message}</Text>
          </View>
        </View>
        <View style={styles.btnsContainer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setDeleteWarningModelState(false)}
          >
            <Text style={styles.btnText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => deleteFromList(id)}
          >
            <Text style={styles.btnText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeleteWarning;
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
  loaderOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  model: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 16,
  },
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 22,
  },
  subTitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    marginTop: 5,
    color: "#444",
  },
  btnsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  confirmBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#FF0707",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  btnText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "white",
  },
});
