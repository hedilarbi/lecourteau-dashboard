import {
  Image,
  ScrollView,
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
import { Entypo } from "@expo/vector-icons";

const ToppingModel = ({ setShowToppingModel }) => {
  const [topping, setTopping] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const ordertopping = {
    image:
      "https://lecourteau.com/wp-content/uploads/2021/11/WingsAlone-scaled-aspect-ratio-264-257-scaled.jpg",
    name: "Delivered",
    price: 2,
    category: "Extra",
  };

  useEffect(() => {
    setTopping(ordertopping);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }
  return (
    <View style={styles.container}>
      <View style={styles.model}>
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowToppingModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>

        <View style={{}}>
          <View style={{}}>
            <View style={[styles.infoTextContainer, { marginVertical: 10 }]}>
              <Text style={styles.title}>Name:</Text>
              <Text style={styles.infoContent}>{topping.name}</Text>
            </View>
            <View style={[styles.infoTextContainer, { marginVertical: 10 }]}>
              <Text style={[styles.title]}>Category:</Text>
              <Text style={styles.infoContent}>{topping.category}</Text>
            </View>
            <View style={[styles.infoTextContainer, { marginVertical: 10 }]}>
              <Text style={styles.title}>Price:</Text>
              <Text style={styles.infoContent}>{topping.price} $</Text>
            </View>

            <View style={[styles.infoTextContainer, { marginVertical: 10 }]}>
              <Image
                source={{ uri: topping.image }}
                style={{ width: 100, height: 100 }}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: 50,
                  paddingVertical: 10,
                  borderRadius: 5,
                  marginLeft: 20,
                }}
              >
                <Text style={styles.title}>Change Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ToppingModel;

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

  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontFamily: Fonts.LATO_REGULAR, fontSize: 20 },
  infoContent: { fontFamily: Fonts.LATO_REGULAR, fontSize: 16, marginLeft: 20 },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
