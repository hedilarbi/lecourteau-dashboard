import { StyleSheet } from "react-native";

import { Pressable } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Colors } from "../constants";
import { useNavigation } from "@react-navigation/native";
const BackButton = () => {
  const navigation = useNavigation();
  return (
    <Pressable style={styles.button} onPress={() => navigation.goBack()}>
      <FontAwesome6 name="arrow-left" size={24} color={Colors.primary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#000000",
    padding: 6,
    width: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
});
export default BackButton;
