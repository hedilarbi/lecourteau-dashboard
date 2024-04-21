import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { deleteCategory, getCategories } from "../services/MenuItemServices";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DeleteWarning from "../components/models/DeleteWarning";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native-gesture-handler";
import { Colors, Fonts } from "../constants";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import UpdateCategoryModal from "../components/models/UpdateCategoryModal";

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showUpdateCategorygModal, setShowUpdateCategorygModal] =
    useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    getCategories()
      .then((response) => {
        if (response?.status) {
          setCategories(response?.data);
        } else {
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetchData();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleShowUpdateCategoryModel = (category) => {
    setCategory(category);
    setShowUpdateCategorygModal(true);
  };
  const handleShowDeleteWarning = (id) => {
    setCategory(id);
    setDeleteWarningModelState(true);
  };
  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={category}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cet article ?`}
          deleter={deleteCategory}
        />
      )}
      {showUpdateCategorygModal && (
        <UpdateCategoryModal
          setRefresh={setRefresh}
          setShowUpdateCategorygModal={setShowUpdateCategorygModal}
          category={category}
        />
      )}

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Catégories
        </Text>

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
        ) : categories.length > 0 ? (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {categories.map((item, index) => (
              <View
                key={item._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Image style={[styles.image]} source={{ uri: item.image }} />
                <Text style={[styles.rowCell, { flex: 1 }]}>{item.name}</Text>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowUpdateCategoryModel(item)}
                >
                  <FontAwesome name="pencil" size={24} color="#2AB2DB" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(item._id)}
                >
                  <MaterialIcons name="delete" size={24} color="#F31A1A" />
                </TouchableOpacity>
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
              Aucune Catégories
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
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
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});
