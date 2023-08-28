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
import { getOffer } from "../../services/OffersServices";

const OfferModel = ({ setShowOfferModel, id }) => {
  const [offer, setOffer] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    getOffer(id)
      .then((response) => {
        if (response.status) {
          console.log(response.data.items);
          setOffer(response.data);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return null;
  }
  return (
    <View style={styles.container}>
      <View style={styles.model}>
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowOfferModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
        </TouchableOpacity>

        <View style={{}}>
          <View style={styles.infoContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: offer.image }}
                style={{ width: 200, height: 100 }}
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
            <View style={[styles.infoTextContainer, { marginVertical: 10 }]}>
              <Text style={styles.title}>name</Text>
              <Text style={styles.infoContent}>{offer.name}</Text>
            </View>
            <View style={[styles.infoTextContainer, { marginVertical: 10 }]}>
              <Text style={[styles.title]}>price</Text>
              <Text style={[styles.infoContent]}>{offer.price}</Text>
            </View>
          </View>
        </View>
        <ScrollView style={{ marginTop: 20 }}>
          {offer.items?.map((item, index) => (
            <View
              key={index}
              style={[
                styles.row,
                index % 2
                  ? { backgroundColor: "transparent" }
                  : { backgroundColor: "rgba(247,166,0,0.3)" },
              ]}
            >
              <Text style={[styles.rowCell]}>{item.item?.name}</Text>

              <Text style={[styles.rowCell]}>{item.quantity}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default OfferModel;

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
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: "cover",
  },
  infoContainer: {},
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
