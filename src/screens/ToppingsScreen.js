import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateToppingModel from "../components/models/CreateToppingModel";
import CreateToppingCategoryModel from "../components/models/CreateToppingCategoryModel";
import ToppingModel from "../components/models/ToppingModel";
import { deleteTopping, getToppings } from "../services/ToppingsServices";
import { ActivityIndicator } from "react-native";
import { filterMenuItems } from "../utils/filters";

const ToppingsScreen = () => {
  const [toppings, setToppings] = useState([]);
  const [toppingsList, setToppingsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showCreateToppingModel, setShowCreateToppingModel] = useState(false);
  const [showCreateToppingCategoryModel, setShowCreateToppingCategoryModel] =
    useState(false);
  const [toppingId, setToppingId] = useState();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const fetchData = async () => {
    getToppings().then((response) => {
      if (response.status) {
        setToppings(response.data);
        setToppingsList(response.data);
      } else {
        console.log(response.message);
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  }, [refresh]);
  const handleShowDeleteWarning = (id) => {
    setToppingId(id);
    setDeleteWarningModelState(true);
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={toppingId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette personalisation ?`}
          deleter={deleteTopping}
        />
      )}
      {showCreateToppingModel && (
        <CreateToppingModel
          setShowCreateToppingModel={setShowCreateToppingModel}
          setRefresh={setRefresh}
        />
      )}
      {showCreateToppingCategoryModel && (
        <CreateToppingCategoryModel
          setShowCreateToppingCategoryModel={setShowCreateToppingCategoryModel}
          setRefresh={setRefresh}
        />
      )}

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Personalisations
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          <SearchBar
            setter={setToppings}
            list={toppingsList}
            filter={filterMenuItems}
          />
          <AddButton
            setShowModel={setShowCreateToppingModel}
            text="Personalisation"
          />
          <AddButton
            setShowModel={setShowCreateToppingCategoryModel}
            text="Catégorie"
          />
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
          <ScrollView style={{ width: "100%", marginTop: 30 }}>
            {toppings.map((topping, index) => (
              <View
                key={topping._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Image style={[styles.image]} source={{ uri: topping.image }} />

                <Text style={[styles.rowCell, { width: "20%" }]}>
                  {topping.name}
                </Text>

                <Text style={[styles.rowCell, { width: "10%" }]}>
                  {topping.category.name}
                </Text>
                <Text style={[styles.rowCell, { width: "10%" }]}>
                  {topping.price} $
                </Text>

                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(topping._id)}
                >
                  <MaterialIcons name="delete" size={24} color="#F31A1A" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ToppingsScreen;

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
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
