import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import DeleteWarning from "../components/models/DeleteWarning";
import { Colors, Fonts } from "../constants";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import CreateSizeModal from "../components/models/CreateSizeModal";
import { deleteSize, getSizes } from "../services/SizesServices";
import { useFocusEffect } from "@react-navigation/native";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";
import BackButton from "../components/BackButton";

const SizesScreen = () => {
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateSizeModel, setShowCreateSizeModel] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState("");
  const [sizes, setSizes] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    getSizes()
      .then((response) => {
        if (response?.status) {
          setSizes(response?.data);
          setSizesList(response?.data);
        } else {
          console.log("error");
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

  const handleShowDeleteWarning = (id) => {
    setSize(id);
    setDeleteWarningModelState(true);
  };

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setSizes(sizesList);
      return;
    }
    const filtered = sizesList.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      return name.includes(query);
    });
    setSizes(filtered);
  };
  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={size}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette taille ?`}
          deleter={deleteSize}
        />
      )}

      {showCreateSizeModel && (
        <CreateSizeModal
          setShowCreateSizeModel={setShowCreateSizeModel}
          setRefresh={setRefresh}
        />
      )}
      <BackButton />
      <PageHeader
        title="Tailles"
        subtitle="Définissez vos formats et options."
        pills={[{ label: `${sizes.length} taille(s)` }]}
        rightContent={
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Entypo name="magnifying-glass" size={18} color={Colors.mgry} />
              <TextInput
                style={styles.searchField}
                placeholder="Chercher une taille"
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
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowCreateSizeModel(true)}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryLabel}>Créer une taille</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { flex: 1.2 }]}>Nom</Text>
            <Text style={[tableStyles.headerCell, { width: 110 }]}>
              Actions
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : sizes.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {sizes.map((item, index) => (
                <View
                  key={item._id}
                  style={[
                    tableStyles.row,
                    index % 2 === 0 && tableStyles.rowAlt,
                  ]}
                >
                  <Text style={[tableStyles.cell, { flex: 1.2 }]}>
                    {item.name}
                  </Text>

                  <View style={[tableStyles.actions, { width: 110 }]}>
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
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune Taille</Text>
              <Text style={styles.emptySubtitle}>
                Créez vos premières tailles pour les articles.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SizesScreen;
const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  content: {
    flexGrow: 1,

    gap: 14,
  },
  searchRow: {
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
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  tableCard: {
    flex: 1,
    overflow: "hidden",
  },
  tableScroll: {
    flex: 1,
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
});
