import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateOfferModel from "../components/models/CreateOfferModel";
import OfferModel from "../components/models/OfferModel";
import { deleteOffer, getOffers } from "../services/OffersServices";
const OffersScreen = () => {
  const navigation = useNavigation();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showCreateOfferModel, setShowCreateOfferModel] = useState(false);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [offerId, setOfferId] = useState("");
  const fetchData = async () => {
    setIsLoading(true);
    getOffers()
      .then((response) => {
        if (response.status) {
          setOffers(response.data);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleShowDeleteWarning = (id) => {
    setOfferId(id);
    setDeleteWarningModelState(true);
  };
  const hadnleShowOfferModel = (id) => {
    navigation.navigate("Offer", { id });
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={offerId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Are you sure to delete this item ?`}
          deleter={deleteOffer}
        />
      )}
      {showCreateOfferModel && (
        <CreateOfferModel
          setShowCreateOfferModel={setShowCreateOfferModel}
          setRefresh={setRefresh}
        />
      )}

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Orders List
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          <SearchBar />
          <AddButton setShowModel={setShowCreateOfferModel} text="Add Offer" />
        </View>
        {isLoading ? (
          <View
            style={{
              flex: 1,

              width: "100%",

              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size={"large"} color="black" />
          </View>
        ) : (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {offers.map((offer, index) => (
              <View
                key={offer._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Image style={[styles.image]} source={{ uri: offer.image }} />
                <Text style={[styles.rowCell]}>{offer.name}</Text>
                <Text style={[styles.rowCell]}>{offer.exp_date}</Text>

                <Text style={[styles.rowCell]}>{offer.price} $</Text>

                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => hadnleShowOfferModel(offer._id)}
                >
                  <FontAwesome name="pencil" size={30} color="#2AB2DB" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(offer._id)}
                >
                  <MaterialIcons name="delete" size={30} color="#F31A1A" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OffersScreen;

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: 200,
    height: 150,
    resizeMode: "cover",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 22,
  },
});
