import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  categoriesTri,
  deleteCategory,
  getCategories,
} from "../services/MenuItemServices";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DeleteWarning from "../components/models/DeleteWarning";
import { Colors, Fonts, Roles } from "../constants";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import UpdateCategoryModal from "../components/models/UpdateCategoryModal";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";
import BackButton from "../components/BackButton";
import AddButton from "../components/AddButton";
import CreateCategoryModel from "../components/models/CreateCategoryModel";

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const { role } = useSelector(selectStaffData);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateCategoryModel, setShowCreateCategoryModel] = useState(false);
  const [showUpdateCategorygModal, setShowUpdateCategorygModal] =
    useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const [search, setSearch] = useState("");
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
  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setCategories(categoriesList);
      return;
    }
    const filtered = categoriesList.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      return name.includes(query);
    });
    setCategories(filtered);
  };
  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={category}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cet article ?`}
          deleter={deleteCategory}
        />
      )}
      {showCreateCategoryModel && (
        <CreateCategoryModel
          setShowCreateCategoryModel={setShowCreateCategoryModel}
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

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BackButton />
        <PageHeader
          title="Catégories"
          subtitle="Organisez et réordonnez vos catégories"
          pills={[
            { label: `${categories.length} catégorie(s)` },
            triMode ? { label: "Mode tri activé" } : null,
          ].filter(Boolean)}
          rightContent={
            <View style={styles.headerActions}>
              <View style={styles.searchBar}>
                <Entypo name="magnifying-glass" size={18} color={Colors.mgry} />
                <TextInput
                  style={styles.searchField}
                  placeholder="Chercher une catégorie"
                  onChangeText={(text) => setSearch(text)}
                  placeholderTextColor={Colors.mgry}
                  value={search}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
              </View>

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                activeOpacity={0.9}
              >
                <Text style={styles.searchButtonLabel}>Rechercher</Text>
              </TouchableOpacity>

              <AddButton
                setShowModel={setShowCreateCategoryModel}
                text="Catégorie"
              />
              {role === Roles.ADMIN &&
                (triMode ? (
                  <View style={styles.triActions}>
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={saveTri}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.primaryLabel}>Sauvegarder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.ghostButton}
                      onPress={discardTri}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.ghostLabel}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setTriMode(true)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.primaryLabel}>
                      Modifier l&apos;ordre
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          }
        />

        <Card style={styles.listCard}>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : categories.length > 0 ? (
            <ScrollView
              style={styles.listScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {categories.map((item, index) => (
                <View
                  key={item._id}
                  style={[
                    tableStyles.row,
                    index % 2 === 0 && tableStyles.rowAlt,
                  ]}
                >
                  <Image style={styles.image} source={{ uri: item.image }} />
                  <View style={styles.info}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                  <View style={[tableStyles.actions, { width: 150 }]}>
                    <TouchableOpacity
                      style={[tableStyles.iconButton, styles.editButton]}
                      onPress={() => handleShowUpdateCategoryModel(item)}
                    >
                      <Ionicons name="pencil" size={18} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tableStyles.iconButton}
                      onPress={() => handleShowDeleteWarning(item._id)}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={20}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                    {triMode && (
                      <View style={styles.triButtons}>
                        <TouchableOpacity
                          style={styles.triButton}
                          onPress={() => handleTri(index, index - 1)}
                        >
                          <Entypo
                            name="chevron-with-circle-up"
                            size={22}
                            color="#1b1b1b"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.triButton}
                          onPress={() => handleTri(index, index + 1)}
                        >
                          <Entypo
                            name="chevron-with-circle-down"
                            size={22}
                            color="#1b1b1b"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune Catégorie</Text>
              <Text style={styles.emptySubtitle}>
                Ajoutez vos premières catégories pour commencer.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flexGrow: 1,
    gap: 14,
    paddingBottom: 20,
    marginTop: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchField: {
    flex: 1,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    color: "#1b1b1b",
  },
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  secondaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  triActions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  primaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  ghostButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  ghostLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
  },
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
  listCard: {
    flex: 1,
    overflow: "hidden",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listScroll: {
    flex: 1,
  },
  image: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  info: {
    flex: 1,
  },
  categoryName: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  triButtons: {
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  triButton: {
    padding: 4,
  },
  emptyState: {
    minHeight: 220,
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
});
