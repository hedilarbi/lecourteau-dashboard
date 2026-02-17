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
  TextInput,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors, Fonts, Roles } from "../constants";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateOfferModel from "../components/models/CreateOfferModel";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";

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
  return (
    <SafeAreaView style={styles.screen}>
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

      <View style={styles.container}>
        <PageHeader
          title="Offres"
          subtitle="Pilotez vos promotions et remises."
          pills={[{ label: `${offers.length} offre(s)` }]}
          rightContent={
            <View style={styles.searchRow}>
              {role === Roles.ADMIN ? (
                <SearchBar
                  setter={setOffers}
                  list={offersList}
                  filter={filterOffers}
                  placeholder="Chercher une offre"
                />
              ) : (
                <SearchBar
                  setter={setOffers}
                  list={offersList}
                  filter={filterRestaurantOffers}
                  placeholder="Chercher une offre"
                />
              )}
              {role === Roles.ADMIN && (
                <AddButton setShowModel={setShowCreateOfferModel} text="Offre" />
              )}
            </View>
          }
        />

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { width: 80 }]}>Visuel</Text>
            <Text style={[tableStyles.headerCell, { flex: 1.4 }]}>Nom</Text>
            <Text style={[tableStyles.headerCell, { flex: 1 }]}>Expire</Text>
            <Text style={[tableStyles.headerCell, { width: 90 }]}>Prix</Text>
            <Text
              style={[
                tableStyles.headerCell,
                { width: role === Roles.ADMIN ? 110 : 130 },
              ]}
            >
              {role === Roles.ADMIN ? "Actions" : "Disponibilité"}
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : offers.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {role === Roles.ADMIN
                ? offers.map((offer, index) => (
                    <View
                      key={offer._id}
                      style={[
                        tableStyles.row,
                        index % 2 === 0 && tableStyles.rowAlt,
                      ]}
                    >
                      <Image style={styles.thumb} source={{ uri: offer.image }} />
                      <Text
                        style={[tableStyles.cell, { flex: 1.4 }]}
                        numberOfLines={1}
                      >
                        {offer.name}
                      </Text>
                      <Text style={[tableStyles.cell, { flex: 1 }]}>
                        {convertDateToDate(offer.expireAt)}
                      </Text>

                      <Text style={[tableStyles.cell, { width: 90 }]}>
                        {offer.price.toFixed(2)} $
                      </Text>

                      <View style={[tableStyles.actions, { width: 110 }]}>
                        <TouchableOpacity
                          style={[tableStyles.iconButton, styles.editButton]}
                          onPress={() => hadnleShowOfferModel(offer._id)}
                        >
                          <Ionicons name="pencil" size={18} color="#1D4ED8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={tableStyles.iconButton}
                          onPress={() => handleShowDeleteWarning(offer._id)}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color={Colors.danger}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                : offers.map((offer, index) => (
                    <View
                      key={offer._id}
                      style={[
                        tableStyles.row,
                        index % 2 === 0 && tableStyles.rowAlt,
                      ]}
                    >
                      <Image
                        style={styles.thumb}
                        source={{ uri: offer.offer.image }}
                      />
                      <Text
                        style={[tableStyles.cell, { flex: 1.4 }]}
                        numberOfLines={1}
                      >
                        {offer.offer.name}
                      </Text>
                      <Text style={[tableStyles.cell, { flex: 1 }]}>
                        {convertDateToDate(offer.offer.expireAt)}
                      </Text>

                      <Text style={[tableStyles.cell, { width: 90 }]}>
                        {offer.offer.price.toFixed(2)} $
                      </Text>
                      <View style={[tableStyles.actions, { width: 130 }]}>
                        <Switch
                          trackColor={{ false: "#767577", true: Colors.primary }}
                          thumbColor="black"
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={() =>
                            updateAvailability(offer._id, index)
                          }
                          value={offer.availability}
                        />
                      </View>
                    </View>
                  ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune Offre</Text>
              <Text style={styles.emptySubtitle}>
                Ajoutez une nouvelle offre ou ajustez votre recherche.
              </Text>
            </View>
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default OffersScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  tableCard: {
    flex: 1,
    overflow: "hidden",
  },
  tableScroll: {
    flex: 1,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
  loader: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
  },
  emptySubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: Colors.tgry,
    marginTop: 4,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
});
