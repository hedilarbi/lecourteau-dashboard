import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";

import { deleteStaffMember, getStaffMembers } from "../services/StaffServices";
import CreateStaffModal from "../components/models/CreateStaffModal";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";

const StaffsScreen = () => {
  const navigation = useNavigation();
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [staffs, setStaffs] = useState([]);
  const [staffsList, setStaffsList] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [staffId, setStaffId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    getStaffMembers()
      .then((response) => {
        if (response.status) {
          setStaffs(response.data);
          setStaffsList(response.data);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleShowDeleteWarning = (id) => {
    setStaffId(id);
    setDeleteWarningModelState(true);
  };

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setStaffs(staffsList);
      return;
    }
    const filtered = staffsList.filter((staff) => {
      const name = staff.name?.toLowerCase() || "";
      const role = staff.role?.toLowerCase() || "";
      return name.includes(query) || role.includes(query);
    });
    setStaffs(filtered);
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={staffId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cet employée ?`}
          deleter={deleteStaffMember}
        />
      )}
      {showCreateStaffModal && (
        <CreateStaffModal
          setShowCreateStaffModal={setShowCreateStaffModal}
          setRefresh={setRefresh}
        />
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Employés"
          subtitle="Invitez, modifiez et gérez vos membres d'équipe."
          pills={[{ label: `${staffs.length} employé(s)` }]}
          rightContent={
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Entypo name="magnifying-glass" size={18} color={Colors.mgry} />
                <TextInput
                  style={styles.searchField}
                  placeholder="Chercher par nom ou rôle"
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
              <AddButton setShowModel={setShowCreateStaffModal} text="Employé" />
            </View>
          }
        />

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { flex: 1.2 }]}>Nom</Text>
            <Text style={[tableStyles.headerCell, { flex: 1 }]}>Rôle</Text>
            <Text style={[tableStyles.headerCell, { width: 110 }]}>
              Actions
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : staffs.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {staffs.map((staff, index) => (
                <View
                  key={staff._id}
                  style={[
                    tableStyles.row,
                    index % 2 === 0 && tableStyles.rowAlt,
                  ]}
                >
                  <Text style={[tableStyles.cell, { flex: 1.2 }]}>
                    {staff.name}
                  </Text>
                  <Text
                    style={[tableStyles.cell, { flex: 1 }]}
                    numberOfLines={1}
                  >
                    {staff.role}
                  </Text>

                  <View style={[tableStyles.actions, { width: 110 }]}>
                    <TouchableOpacity
                      style={[tableStyles.iconButton, styles.editButton]}
                      onPress={() =>
                        navigation.navigate("Employee", { id: staff._id })
                      }
                    >
                      <Ionicons name="pencil" size={18} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tableStyles.iconButton}
                      onPress={() => handleShowDeleteWarning(staff._id)}
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
              <Text style={styles.emptyTitle}>Aucun Employé</Text>
              <Text style={styles.emptySubtitle}>
                Invitez vos premiers membres pour commencer.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffsScreen;

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
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
});
