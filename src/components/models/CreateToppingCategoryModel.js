import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

import { Colors, Fonts } from "../../constants";
import { createToppingCategory } from "../../services/ToppingsServices";
import SuccessModel from "./SuccessModel";

const CreateToppingCategoryModel = ({ setShowCreateToppingCategoryModel }) => {
  const [name, setName] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const saveItem = async () => {
    setIsLoading(true);
    createToppingCategory(name)
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
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

        setShowCreateToppingCategoryModel(false);
      }, 1000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
  return (
    <View style={styles.container}>
      {showSuccessModel && <SuccessModel />}
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
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowCreateToppingCategoryModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>
        <View>
          <View style={styles.name}>
            <Text style={styles.text}>Name</Text>
            <TextInput
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 18,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5,
                paddingTop: 5,
                borderWidth: 1,
                borderRadius: 5,
                marginLeft: 20,
              }}
              placeholder="Item Name"
              placeholderTextColor={Colors.tgry}
              onChangeText={(text) => setName(text)}
            />
          </View>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 40,
            alignSelf: "flex-end",
            backgroundColor: Colors.primary,
            paddingHorizontal: 60,
            paddingVertical: 10,
            borderRadius: 5,
          }}
          onPress={saveItem}
        >
          <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateToppingCategoryModel;

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
    width: "70%",
  },

  text: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 22,
  },
  name: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
  },
});
