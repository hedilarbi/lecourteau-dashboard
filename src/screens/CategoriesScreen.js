import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  categoriesTri,
  deleteCategory,
  getCategories,
} from "../services/MenuItemServices";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DeleteWarning from "../components/models/DeleteWarning";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native-gesture-handler";
import { Colors, Fonts, Roles } from "../constants";
import { FontAwesome, MaterialIcons, Entypo } from "@expo/vector-icons";
import UpdateCategoryModal from "../components/models/UpdateCategoryModal";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const { role } = useSelector(selectStaffData);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showUpdateCategorygModal, setShowUpdateCategorygModal] =
    useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const handleTri = async (from, to) => {
    const categoriesCopy = [...categories];
    categoriesCopy[from].order = to;
    categoriesCopy[to].order = from;
    const temp = categoriesCopy[from];
    categoriesCopy[from] = categoriesCopy[to];
    categoriesCopy[to] = temp;
    setCategories(categoriesCopy);
  };

  const discardTri = () => {
    setCategories(categoriesList);
    setTriMode(false);
  };

  const saveTri = async () => {
    setIsTriLoading(true);
    try {
      const list = categories.map((item) => {
        return { id: item._id, order: item.order };
      });
      const response = await categoriesTri(list);
      if (response.status) {
        setCategoriesList(categories);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setTriMode(false);
      setIsTriLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    getCategories()
      .then((response) => {
        if (response?.status) {
          setCategories(response?.data);
          setCategoriesList(response?.data);
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
      {isTriLoading && <Spinner visibility={isTriLoading} />}

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Catégories
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
            borderWidth: 1,
            borderRadius: 5,
            flexDirection: "row",
            alignItems: "center",
            width: "30%",
            justifyContent: "center",
            marginTop: 20,
          }}
          onPress={() => navigation.navigate("Sizes")}
        >
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
              color: "black",
              marginLeft: 10,
            }}
          >
            Liste des tailles
          </Text>
        </TouchableOpacity>
        {role === Roles.ADMIN && (
          <View>
            {triMode ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  width: "25%",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: Colors.primary,
                    paddingVertical: 10,
                    borderRadius: 5,
                    paddingHorizontal: 18,
                    justifyContent: "space-between",
                  }}
                  onPress={saveTri}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_BOLD,
                      fontSize: 18,
                    }}
                  >
                    Sauvegarder
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: Colors.tgry,
                    paddingVertical: 10,
                    borderRadius: 5,
                    paddingHorizontal: 18,
                    justifyContent: "space-between",
                  }}
                  onPress={discardTri}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.LATO_BOLD,
                      fontSize: 18,
                      color: "black",
                    }}
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: Colors.primary,
                  paddingVertical: 10,
                  borderRadius: 5,
                  paddingHorizontal: 18,
                  justifyContent: "space-between",
                  marginTop: 20,
                  width: "25%",
                }}
                onPress={() => setTriMode(true)}
              >
                <Text
                  style={{
                    fontFamily: Fonts.LATO_BOLD,
                    fontSize: 18,
                  }}
                >
                  Modifier l'ordre
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
                {triMode && (
                  <View
                    style={{ justifyContent: "space-between", height: 100 }}
                  >
                    <TouchableWithoutFeedback
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 4,
                      }}
                      onPress={() => handleTri(index, index - 1)}
                    >
                      <Entypo
                        name="chevron-with-circle-up"
                        size={28}
                        color="black"
                      />
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 4,
                      }}
                      onPress={() => handleTri(index, index + 1)}
                    >
                      <Entypo
                        name="chevron-with-circle-down"
                        size={28}
                        color="black"
                      />
                    </TouchableWithoutFeedback>
                  </View>
                )}
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
