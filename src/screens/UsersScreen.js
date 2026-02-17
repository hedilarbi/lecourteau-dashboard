import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Colors, Fonts } from "../constants";

import DeleteWarning from "../components/models/DeleteWarning";

import {
  banUser,
  deleteUser,
  getUsersPagination,
} from "../services/UsersServices";

import { useNavigation } from "@react-navigation/native";
import ErrorScreen from "../components/ErrorScreen";
import LoadingScreen from "../components/LoadingScreen";
import BanWarning from "../components/models/BanWarning";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";
import SearchBar from "../components/SearchBar";

const UsersScreen = () => {
  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [banWarningModelState, setBanWarningModelState] = useState(false);
  const [userId, setUserId] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [navigaTo, setNavigaTo] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      if (page < 1) {
        return;
      }
      if (pages !== 0 && page > pages) {
        return;
      }
      const response = await getUsersPagination(page, 20, search);
      if (response.status) {
        setUsers(response.data.users);
        setPages(response.data.pages);
      }
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [refresh, page]);
  const handleShowUserModel = (id) => {
    navigation.navigate("User", { id });
  };

  const handleShowDeleteWarning = (id) => {
    setUserId(id);
    setDeleteWarningModelState(true);
  };

  const handleShowBanWarning = (id) => {
    setUserId(id);
    setBanWarningModelState(true);
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchData();
  //   }, [])
  // );

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={userId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cet utilisateur ?`}
          deleter={deleteUser}
        />
      )}

      {banWarningModelState && (
        <BanWarning
          id={userId._id}
          setBanWarningModelState={setBanWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={
            userId.isBanned
              ? `Etes-vous sûr de vouloir activer cet utilisateur ?`
              : `Etes-vous sûr de vouloir bannir cet utilisateur ?`
          }
        />
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Utilisateurs"
          subtitle="Recherchez, consultez et gérez les comptes."
          pills={[
            { label: `Page ${page}${pages > 0 ? `/${pages}` : ""}` },
            { label: `${users.length} utilisateur(s)` },
          ]}
          rightContent={
            <View style={styles.searchRow}>
              <View style={styles.searchFieldWrap}>
                <SearchBar
                  placeholder="Chercher par nom"
                  onChangeText={setSearch}
                  value={search}
                />
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={fetchData}
                activeOpacity={0.9}
              >
                <Text style={styles.searchButtonLabel}>Rechercher</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { flex: 1.1 }]}>Nom</Text>
            <Text style={[tableStyles.headerCell, { flex: 1 }]}>
              Téléphone
            </Text>
            <Text style={[tableStyles.headerCell, { flex: 1.4 }]}>Email</Text>
            <Text style={[tableStyles.headerCell, { width: 120 }]}>
              Actions
            </Text>
          </View>
          {users?.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {users.map((user, index) => (
                <View
                  key={user._id}
                  style={[
                    tableStyles.row,
                    index % 2 === 0 && tableStyles.rowAlt,
                  ]}
                >
                  <Text style={[tableStyles.cell, { flex: 1.1 }]}>
                    {user.name}
                  </Text>
                  <Text style={[tableStyles.cell, { flex: 1 }]}>
                    {user.phone_number}
                  </Text>
                  <Text
                    style={[tableStyles.cell, { flex: 1.4 }]}
                    numberOfLines={1}
                  >
                    {user.email}
                  </Text>
                  <View style={[tableStyles.actions, { width: 120 }]}>
                    <TouchableOpacity
                      style={[tableStyles.iconButton, styles.editButton]}
                      onPress={() => handleShowUserModel(user._id)}
                    >
                      <Ionicons name="pencil" size={18} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tableStyles.iconButton}
                      onPress={() => handleShowDeleteWarning(user._id)}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={20}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tableStyles.iconButton}
                      onPress={() => handleShowBanWarning(user)}
                    >
                      <Entypo
                        name="block"
                        size={20}
                        color={user.isBanned ? Colors.success : Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun Utilisateur</Text>
              <Text style={styles.emptySubtitle}>
                Essayez une autre recherche ou rafraîchissez la page.
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.paginationInfo}>
          <Text style={styles.paginationLabel}>
            {`Page ${page}${pages > 0 ? `/${pages}` : ""}`}
          </Text>
        </View>
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={() => setPage((prev) => prev - 1)}
            style={[
              styles.pageButton,
              page <= 1 && styles.pageButtonDisabled,
            ]}
            disabled={page <= 1}
          >
            <Text style={styles.pageButtonLabel}>Précédent</Text>
          </TouchableOpacity>

          {pages > 0 && (
            <View style={styles.pageInputRow}>
              <TextInput
                style={styles.pageInput}
                placeholder="Aller à"
                onChangeText={(text) => setNavigaTo(text)}
                placeholderTextColor={Colors.mgry}
                keyboardType="numeric"
                value={navigaTo}
              />
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  !navigaTo && styles.pageButtonDisabled,
                ]}
                onPress={() => {
                  const target = parseInt(navigaTo, 10);
                  if (!isNaN(target)) {
                    setPage(target);
                  }
                  setNavigaTo("");
                }}
                disabled={!navigaTo}
              >
                <Text style={styles.pageButtonLabel}>Aller</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setPage((prev) => prev + 1)}
            style={[
              styles.pageButton,
              page >= pages && styles.pageButtonDisabled,
            ]}
            disabled={page >= pages}
          >
            <Text style={styles.pageButtonLabel}>Suivant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.screenBg,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  searchFieldWrap: {
    flex: 1,
    minWidth: 260,
  },
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButtonLabel: {
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
  paginationInfo: {
    alignItems: "center",
  },
  paginationLabel: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 16,
    color: Colors.tgry,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  pageButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pageButtonDisabled: {
    backgroundColor: Colors.mgry,
    borderColor: Colors.mgry,
  },
  pageButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  pageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pageInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    width: 90,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: "#1b1b1b",
  },
});

export default UsersScreen;
