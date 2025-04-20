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
  Switch,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors, Fonts, Roles } from "../constants";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateOfferModel from "../components/models/CreateOfferModel";

import { deleteOffer, getOffers } from "../services/OffersServices";
import { convertDateToDate } from "../utils/dateHandlers";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import {
  getRestaurantOffers,
  updateRestaurantOfferAvailability,
} from "../services/RestaurantServices";
import { filterOffers, filterRestaurantOffers } from "../utils/filters";
const OffersScreen = () => {
  const { role, restaurant } = useSelector(selectStaffData);
  const navigation = useNavigation();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showCreateOfferModel, setShowCreateOfferModel] = useState(false);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [offerId, setOfferId] = useState("");
  const [offersList, setOffersList] = useState([]);
  const fetchData = async () => {
    setIsLoading(true);
    if (role === Roles.ADMIN) {
      getOffers()
        .then((response) => {
          if (response.status) {
            setOffers(response.data);
            setOffersList(response.data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getRestaurantOffers(restaurant)
        .then((response) => {
          if (response.status) {
            setOffers(response.data.offers);
            setOffersList(response.data.offers);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
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

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
  const updateAvailability = async (offerId, index) => {
    updateRestaurantOfferAvailability(restaurant, offerId).then((response) => {
      if (response.status) {
        const updatedMenuItems = [...offers];

        // Modify the availability of the specific item at the given index
        updatedMenuItems[index] = {
          ...updatedMenuItems[index],
          availability: !updatedMenuItems[index].availability, // Change the availability (toggling in this example)
        };

        // Update the state with the modified array
        setOffers(updatedMenuItems);
      }
    });
  };
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={offerId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette offre ?`}
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
          Offres
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          {role === Roles.ADMIN ? (
            <SearchBar
              setter={setOffers}
              list={offersList}
              filter={filterOffers}
            />
          ) : (
            <SearchBar
              setter={setOffers}
              list={offersList}
              filter={filterRestaurantOffers}
            />
          )}
          {role === Roles.ADMIN && (
            <AddButton setShowModel={setShowCreateOfferModel} text="Offre" />
          )}
        </View>
        {offers.length > 0 ? (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {role === Roles.ADMIN
              ? offers.map((offer, index) => (
                  <View
                    key={offer._id}
                    style={[
                      styles.row,
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Image
                      style={[styles.image]}
                      source={{ uri: offer.image }}
                    />
                    <Text style={[styles.rowCell, { width: "20%" }]}>
                      {offer.name}
                    </Text>
                    <Text style={[styles.rowCell]}>
                      {convertDateToDate(offer.expireAt)}
                    </Text>

                    <Text style={[styles.rowCell]}>
                      {offer.price.toFixed(2)} $
                    </Text>

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
                ))
              : offers.map((offer, index) => (
                  <View
                    key={offer._id}
                    style={[
                      styles.row,
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Image
                      style={[styles.image]}
                      source={{ uri: offer.offer.image }}
                    />
                    <Text style={[styles.rowCell, { width: "20%" }]}>
                      {offer.offer.name}
                    </Text>
                    <Text style={[styles.rowCell]}>
                      {convertDateToDate(offer.offer.expireAt)}
                    </Text>

                    <Text style={[styles.rowCell]}>
                      {offer.offer.price.toFixed(2)} $
                    </Text>
                    <Switch
                      trackColor={{ false: "#767577", true: Colors.primary }}
                      thumbColor="black"
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => updateAvailability(offer._id, index)}
                      value={offer.availability}
                    />
                  </View>
                ))}
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 16,
              marginTop: 20,
            }}
          >
            <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
              Aucune Offre
            </Text>
          </View>
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
