import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Colors, Fonts } from "../constants";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import ErrorScreen from "../components/ErrorScreen";
import { Entypo } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  createSizeGroup,
  deleteSizeGroupService,
  getSizesGroups,
  updateSizeGroup,
} from "../services/sizesGroupeServices";
import { getSizes } from "../services/SizesServices";
import BackButton from "../components/BackButton";
import { useNavigation } from "@react-navigation/native";

const SizesGroupeScreen = () => {
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const listMaxHeight = Math.min(
    260,
    Math.max(140, Math.round(windowHeight * 0.35))
  );
  const [groups, setGroups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editName, setEditName] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [formError, setFormError] = useState("");
  const [editFormError, setEditFormError] = useState("");
  const [sizeSearch, setSizeSearch] = useState("");
  const [editGroupId, setEditGroupId] = useState("");
  const [editBaseSizes, setEditBaseSizes] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [groupsRes, sizesRes] = await Promise.all([
        getSizesGroups(),
        getSizes(),
      ]);

      if (groupsRes?.status) {
        setGroups(groupsRes.data);
      } else {
        setError(true);
      }

      if (sizesRes?.status) {
        setSizes(sizesRes.data);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  useEffect(() => {
    if (showCreateModal) {
      setGroupName("");
      setSelectedSizes([]);
      setSizeSearch("");
      setFormError("");
    }
  }, [showCreateModal]);

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormError("");
    setEditName("");
    setSelectedSizes([]);
    setEditGroupId("");
    setEditBaseSizes([]);
    setSizeSearch("");
  };

  const sizeMap = useMemo(() => {
    const map = new Map();
    sizes.forEach((s) => map.set(s._id, s));
    return map;
  }, [sizes]);

  const normalizedSearch = sizeSearch.trim().toLowerCase();

  const availableSizes = useMemo(
    () => sizes.filter((size) => !selectedSizes.includes(size._id)),
    [sizes, selectedSizes]
  );

  const filteredAvailable = useMemo(
    () =>
      normalizedSearch
        ? availableSizes.filter((size) =>
            size.name.toLowerCase().includes(normalizedSearch)
          )
        : availableSizes,
    [availableSizes, normalizedSearch]
  );

  const selectedSizeObjects = useMemo(
    () => selectedSizes.map((id) => sizeMap.get(id)).filter(Boolean),
    [selectedSizes, sizeMap]
  );

  const handleAddSize = (id) => {
    setSelectedSizes((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemoveSize = (id) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== id));
  };

  const handleOpenEdit = (group) => {
    const baseIds = group.sizes?.map((s) => s._id) || [];
    setEditGroupId(group._id);
    setEditName(group.name);
    setEditBaseSizes(baseIds);
    setSelectedSizes(baseIds);
    setSizeSearch("");
    setEditFormError("");
    setShowCreateModal(false);
    setShowEditModal(true);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setFormError("Nom requis");
      return;
    }
    if (selectedSizes.length === 0) {
      setFormError("Sélectionnez au moins une taille");
      return;
    }
    setFormError("");
    setIsLoading(true);
    const response = await createSizeGroup(groupName.trim(), selectedSizes);
    setIsLoading(false);
    if (response?.status) {
      setShowCreateModal(false);
      setGroupName("");
      setSelectedSizes([]);
      setSizeSearch("");
      setRefresh((r) => r + 1);
    } else {
      setFormError(response?.message || "Erreur lors de la création");
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      setEditFormError("Nom requis");
      return;
    }
    if (selectedSizes.length === 0) {
      setEditFormError("Sélectionnez au moins une taille");
      return;
    }
    setEditFormError("");
    const addSizes = selectedSizes.filter((id) => !editBaseSizes.includes(id));
    const removeSizes = editBaseSizes.filter((id) => !selectedSizes.includes(id));
    setIsLoading(true);
    const response = await updateSizeGroup(
      editGroupId,
      editName.trim(),
      addSizes,
      removeSizes
    );
    setIsLoading(false);
    if (response?.status) {
      closeEditModal();
      setRefresh((r) => r + 1);
    } else {
      setEditFormError(response?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleShowDelete = (id) => {
    setSelectedGroupId(id);
    setDeleteWarningModelState(true);
  };

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={selectedGroupId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          setIsLoading={setIsLoading}
          message={`Etes-vous sûr de vouloir supprimer ce groupe ?`}
          deleter={deleteSizeGroupService}
        />
      )}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalCard, { maxHeight: windowHeight * 0.9 }]}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.modalTitle}>Ajouter un groupe de tailles</Text>
                <Text style={styles.modalDescription}>
                  Donnez un nom au groupe et sélectionnez les tailles associées.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setFormError("");
                }}
                activeOpacity={0.8}
              >
                <Entypo name="cross" size={20} color={Colors.tgry} />
              </TouchableOpacity>
            </View>
            {formError ? (
              <Text style={styles.modalError}>{formError}</Text>
            ) : null}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nom du groupe</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Pizzas familiales"
                placeholderTextColor={Colors.tgry}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.columnCard}>
                <View style={styles.columnHeader}>
                  <View>
                    <Text style={styles.columnTitle}>Tailles disponibles</Text>
                    <Text style={styles.columnSubtitle}>
                      Cliquez pour ajouter au groupe
                    </Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {availableSizes.length}
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une taille"
                  placeholderTextColor={Colors.tgry}
                  value={sizeSearch}
                  onChangeText={setSizeSearch}
                />
                <ScrollView
                  style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                  contentContainerStyle={styles.listContent}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredAvailable.length > 0 ? (
                    filteredAvailable.map((size) => (
                      <TouchableOpacity
                        key={size._id}
                        style={styles.sizeRow}
                        onPress={() => handleAddSize(size._id)}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.sizeName}>{size.name}</Text>
                        <View style={styles.sizeAction}>
                          <Entypo name="plus" size={18} color="#1b1b1b" />
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyListBox}>
                      <Text style={styles.emptyListTitle}>
                        {sizeSearch ? "Aucune taille trouvée" : "Aucune taille disponible"}
                      </Text>
                      <Text style={styles.emptyListSubtitle}>
                        {sizeSearch
                          ? "Ajustez votre recherche pour voir plus de résultats."
                          : "Ajoutez des tailles depuis l'écran Gérer les tailles."}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              <View style={styles.columnCard}>
                <View style={styles.columnHeader}>
                  <View>
                    <Text style={styles.columnTitle}>Tailles sélectionnées</Text>
                    <Text style={styles.columnSubtitle}>
                      {selectedSizes.length} sélectionnée(s)
                    </Text>
                  </View>
                </View>
                <ScrollView
                  style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                  contentContainerStyle={styles.listContent}
                  nestedScrollEnabled
                >
                  {selectedSizeObjects.length > 0 ? (
                    selectedSizeObjects.map((size) => (
                      <TouchableOpacity
                        key={size._id}
                        style={styles.sizeRow}
                        onPress={() => handleRemoveSize(size._id)}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.sizeName}>{size.name}</Text>
                        <View style={[styles.sizeAction, styles.removeAction]}>
                          <Entypo
                            name="minus"
                            size={18}
                            color={Colors.danger}
                          />
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyListBox}>
                      <Text style={styles.emptyListTitle}>
                        Aucune taille sélectionnée
                      </Text>
                      <Text style={styles.emptyListSubtitle}>
                        Ajoutez des tailles à partir de la liste de gauche.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Text style={styles.selectionHelper}>
                {selectedSizes.length} taille(s) sélectionnée(s)
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={styles.ghostButton}
                  onPress={() => {
                    setShowCreateModal(false);
                    setFormError("");
                  }}
                >
                  <Text style={styles.ghostLabel}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.modalCreateButton]}
                  onPress={handleCreate}
                >
                  <Text style={styles.primaryLabel}>Créer le groupe</Text>
                </TouchableOpacity>
              </View>
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={showEditModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalCard, { maxHeight: windowHeight * 0.9 }]}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.modalTitle}>Modifier un groupe de tailles</Text>
                <Text style={styles.modalDescription}>
                  Ajustez le nom et les tailles associées au groupe.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeEditModal}
                activeOpacity={0.8}
              >
                <Entypo name="cross" size={20} color={Colors.tgry} />
              </TouchableOpacity>
            </View>
            {editFormError ? (
              <Text style={styles.modalError}>{editFormError}</Text>
            ) : null}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nom du groupe</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Pizzas familiales"
                placeholderTextColor={Colors.tgry}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.columnCard}>
                <View style={styles.columnHeader}>
                  <View>
                    <Text style={styles.columnTitle}>Tailles disponibles</Text>
                    <Text style={styles.columnSubtitle}>
                      Cliquez pour ajouter au groupe
                    </Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {availableSizes.length}
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une taille"
                  placeholderTextColor={Colors.tgry}
                  value={sizeSearch}
                  onChangeText={setSizeSearch}
                />
                <ScrollView
                  style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                  contentContainerStyle={styles.listContent}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredAvailable.length > 0 ? (
                    filteredAvailable.map((size) => (
                      <TouchableOpacity
                        key={size._id}
                        style={styles.sizeRow}
                        onPress={() => handleAddSize(size._id)}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.sizeName}>{size.name}</Text>
                        <View style={styles.sizeAction}>
                          <Entypo name="plus" size={18} color="#1b1b1b" />
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyListBox}>
                      <Text style={styles.emptyListTitle}>
                        {sizeSearch ? "Aucune taille trouvée" : "Aucune taille disponible"}
                      </Text>
                      <Text style={styles.emptyListSubtitle}>
                        {sizeSearch
                          ? "Ajustez votre recherche pour voir plus de résultats."
                          : "Ajoutez des tailles depuis l'écran Gérer les tailles."}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              <View style={styles.columnCard}>
                <View style={styles.columnHeader}>
                  <View>
                    <Text style={styles.columnTitle}>Tailles sélectionnées</Text>
                    <Text style={styles.columnSubtitle}>
                      {selectedSizes.length} sélectionnée(s)
                    </Text>
                  </View>
                </View>
                <ScrollView
                  style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                  contentContainerStyle={styles.listContent}
                  nestedScrollEnabled
                >
                  {selectedSizeObjects.length > 0 ? (
                    selectedSizeObjects.map((size) => (
                      <TouchableOpacity
                        key={size._id}
                        style={styles.sizeRow}
                        onPress={() => handleRemoveSize(size._id)}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.sizeName}>{size.name}</Text>
                        <View style={[styles.sizeAction, styles.removeAction]}>
                          <Entypo
                            name="minus"
                            size={18}
                            color={Colors.danger}
                          />
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyListBox}>
                      <Text style={styles.emptyListTitle}>
                        Aucune taille sélectionnée
                      </Text>
                      <Text style={styles.emptyListSubtitle}>
                        Ajoutez des tailles à partir de la liste de gauche.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Text style={styles.selectionHelper}>
                {selectedSizes.length} taille(s) sélectionnée(s)
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity style={styles.ghostButton} onPress={closeEditModal}>
                  <Text style={styles.ghostLabel}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.modalCreateButton]}
                  onPress={handleUpdate}
                >
                  <Text style={styles.primaryLabel}>Mettre à jour</Text>
                </TouchableOpacity>
              </View>
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <View style={{ paddingLeft: 20, paddingTop: 20 }}>
        <BackButton />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Groupes de tailles"
          subtitle="Organisez vos tailles par famille."
          pills={[{ label: `${groups.length} groupe(s)` }]}
          rightContent={
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <AddButton setShowModel={setShowCreateModal} text="Groupe" />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate("Sizes")}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryLabel}>Gérer les tailles</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { flex: 1.4 }]}>Groupe</Text>
            <Text style={[tableStyles.headerCell, { flex: 2 }]}>Tailles</Text>
            <Text style={[tableStyles.headerCell, { width: 110 }]}>
              Actions
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : groups.length > 0 ? (
            <ScrollView style={styles.tableScroll}>
              {groups.map((group, index) => (
                <View
                  key={group._id}
                  style={[
                    tableStyles.row,
                    index % 2 === 0 && tableStyles.rowAlt,
                  ]}
                >
                  <Text style={[tableStyles.cell, { flex: 1.4 }]}>
                    {group.name}
                  </Text>
                  <Text
                    style={[tableStyles.cell, { flex: 2 }]}
                    numberOfLines={2}
                  >
                    {group.sizes?.map((s) => s.name).join(", ")}
                  </Text>
                  <View
                    style={[
                      tableStyles.actions,
                      { width: 130, justifyContent: "flex-start", gap: 8 },
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.actionIcon, styles.editActionIcon]}
                      onPress={() => handleOpenEdit(group)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="pencil" size={18} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionIcon, styles.deleteActionIcon]}
                      onPress={() => handleShowDelete(group._id)}
                      activeOpacity={0.85}
                    >
                      <Entypo name="trash" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun groupe</Text>
              <Text style={styles.emptySubtitle}>
                Créez un groupe de tailles pour commencer.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SizesGroupeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
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
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    gap: 6,
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
  primaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  editActionIcon: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
  deleteActionIcon: {
    backgroundColor: "rgba(225,79,79,0.1)",
    borderColor: "rgba(225,79,79,0.4)",
  },
  deleteLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 12,
    color: Colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 1040,
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  modalContent: {
    gap: 16,
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 30,
    color: "#1b1b1b",
  },
  modalDescription: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
  },
  modalError: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.danger,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  modalInput: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#1b1b1b",
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    flex: 1,
    minHeight: 0,
  },
  columnCard: {
    flex: 1,
    minWidth: 280,
    minHeight: 0,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  columnTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  columnSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    marginTop: 2,
  },
  countBadge: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.lgry,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 12,
    color: "#1b1b1b",
  },
  searchInput: {
    backgroundColor: Colors.gry,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1b1b1b",
  },
  listScroll: {
    flexGrow: 0,
  },
  listContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 2,
  },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gry,
    width: "48%",
    minWidth: 140,
    height: 56,
  },
  sizeName: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  sizeAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  removeAction: {
    backgroundColor: "rgba(225,79,79,0.1)",
    borderColor: "rgba(225,79,79,0.5)",
  },
  emptyListBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.gry,
    gap: 4,
    width: "100%",
    minHeight: 80,
  },
  emptyListTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  emptyListSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
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
  selectionHelper: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
  },
  modalCreateButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
