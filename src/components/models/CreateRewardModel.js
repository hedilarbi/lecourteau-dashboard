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
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";

import { createReward } from "../../services/RewardServices";
import { getItemsNames } from "../../services/MenuItemServices";
import SuccessModel from "./SuccessModel";

const CreateRewardModel = ({ setShowCreateRewardModel, setRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [points, setPoints] = useState("");
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [error, setError] = useState("");
  const fetchData = async () => {
    getItemsNames().then((response) => {
      if (response.status) {
        let list = [];
        response.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setItems(list);
      } else {
        console.log(response);
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  }, []);

  const saveItem = async () => {
    if (Object.keys(item).length < 1) {
      setError("Article manquant");
      return;
    }
    if (points.length < 1) {
      setError("Nombre de points manquant");
      return;
    }
    createReward(points, item.id).then((response) => {
      if (response.status) {
        setShowSuccessModel(true);
        setRefresh((prev) => prev + 1);
      }
    });
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setRefresh((prev) => prev + 1);
        setShowCreateRewardModel(false);
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Ajouter une récompense
          </Text>
          <TouchableOpacity onPress={() => setShowCreateRewardModel(false)}>
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
        </View>
        {error.length > 0 && (
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
              textAlign: "center",
              color: "red",
            }}
          >
            {error}
          </Text>
        )}
        <View>
          <View style={styles.name}>
            <Text style={styles.text}>Article</Text>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              selectedStyle={styles.selectedStyle}
              itemContainerStyle={styles.itemContainerStyle}
              itemTextStyle={styles.itemTextStyle}
              containerStyle={styles.containerStyle}
              data={items}
              maxHeight={300}
              labelField="label"
              valueField="label"
              placeholder="Chosir un article"
              value={item.name}
              onChange={(item) => {
                setItem({ id: item.value, name: item.label });
              }}
            />
          </View>
          <View style={styles.name}>
            <Text style={styles.text}>Points</Text>
            <TextInput
              style={{
                fontFamily: Fonts.LATO_REGULAR,
                fontSize: 18,
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderColor: Colors.primary,
                borderWidth: 2,

                marginLeft: 20,
              }}
              placeholder="1200"
              placeholderTextColor={Colors.tgry}
              onChangeText={(text) => setPoints(text)}
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
          <Text style={styles.text}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateRewardModel;

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
  image: { flexDirection: "row", marginTop: 40, alignItems: "center" },
  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  name: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
  },

  dropdown: {
    height: 40,
    width: 200,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 40,
  },
  selectedStyle: {
    height: 18,
  },
  icon: {
    marginRight: 5,
  },
  itemContainerStyle: {
    padding: 0,
    margin: 0,
  },
  itemTextStyle: {
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
  priceBox: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginLeft: 40,
  },
  prices: { marginTop: 40, flexDirection: "row", alignItems: "center" },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 40,
  },
});
