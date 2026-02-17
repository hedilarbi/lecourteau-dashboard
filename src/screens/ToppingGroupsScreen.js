import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import ErrorScreen from "../components/ErrorScreen";
import BackButton from "../components/BackButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Entypo } from "@expo/vector-icons";
import {
  createToppingGroup,
  deleteToppingGroup,
  getToppingGroups,
} from "../services/ToppingGroupsServices";
import { getToppings } from "../services/ToppingsServices";

const ToppingGroupsScreen = () => {
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const listMaxHeight = Math.min(
    260,
    Math.max(140, Math.round(windowHeight * 0.35)),
  );
  const [groups, setGroups] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [search, setSearch] = useState("");
  const [required, setRequired] = useState(false);
  const [minSelection, setMinSelection] = useState("");
  const [maxSelection, setMaxSelection] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [groupsRes, toppingsRes] = await Promise.all([
        getToppingGroups(),
        getToppings(),
      ]);
      if (groupsRes?.status) {
        setGroups(groupsRes.data);
      } else {
        setError(true);
      }
      if (toppingsRes?.status) {
        setToppings(toppingsRes.data);
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
      setSelectedToppings([]);
      setSearch("");
      setRequired(false);
      setMinSelection("");
      setMaxSelection("");
      setFormError("");
    }
  }, [showCreateModal]);

  const toppingMap = useMemo(() => {
    const map = new Map();
    toppings.forEach((t) => map.set(t._id, t));
    return map;
  }, [toppings]);

  const availableToppings = useMemo(
    () => toppings.filter((t) => !selectedToppings.includes(t._id)),
    [toppings, selectedToppings],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredAvailable = useMemo(
    () =>
      normalizedSearch
        ? availableToppings.filter((t) =>
            t.name.toLowerCase().includes(normalizedSearch),
          )
        : availableToppings,
    [availableToppings, normalizedSearch],
  );

  const selectedToppingObjects = useMemo(
    () => selectedToppings.map((id) => toppingMap.get(id)).filter(Boolean),
    [selectedToppings, toppingMap],
  );

  const formatRule = (rule) => {
    if (!rule) return "—";
    const min = rule.min ?? 0;
    const maxText =
      rule.max === null || rule.max === undefined ? "Illimité" : rule.max;
    return rule.isRequired
      ? `Oui (min ${min} / max ${maxText})`
      : `Non (max ${maxText})`;
  };

  const handleAdd = (id) => {
    setSelectedToppings((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemove = (id) => {
    setSelectedToppings((prev) => prev.filter((t) => t !== id));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setFormError("Nom requis");
      return;
    }
    if (selectedToppings.length === 0) {
      setFormError("Ajoutez au moins une personnalisation");
      return;
    }
    const minInput = minSelection === "" ? null : parseInt(minSelection, 10);
    const maxInput = maxSelection === "" ? null : parseInt(maxSelection, 10);
    let parsedMin = null;
    let parsedMax = null;
    if (required) {
      parsedMin = minInput;
      parsedMax = maxInput;
      if (parsedMin === null || Number.isNaN(parsedMin) || parsedMin < 1) {
        setFormError(
          "Indiquez un minimum valide (≥1) pour une sélection requise",
        );
        return;
      }
      if (
        parsedMax !== null &&
        (Number.isNaN(parsedMax) || parsedMax < parsedMin)
      ) {
        setFormError("Le maximum doit être supérieur ou égal au minimum");
        return;
      }
    } else {
      parsedMin = 0;
      parsedMax =
        maxInput === null || Number.isNaN(maxInput) || maxInput < 0
          ? null
          : maxInput;
    }
    setFormError("");
    setIsLoading(true);
    const payload = {
      name: groupName.trim(),
      toppings: selectedToppings,
      selectionRule: {
        isRequired: required,
        min: parsedMin,
        max: parsedMax,
      },
    };
    const response = await createToppingGroup(payload);
    setIsLoading(false);
    if (response?.status) {
      setShowCreateModal(false);
      setRefresh((r) => r + 1);
    } else {
      setFormError(response?.message || "Erreur lors de la création");
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
    <View style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={selectedGroupId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          setIsLoading={setIsLoading}
          deleter={deleteToppingGroup}
          message="Etes-vous sûr de vouloir supprimer ce groupe ?"
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
                  <Text style={styles.modalTitle}>
                    Ajouter un groupe de personnalisations
                  </Text>
                  <Text style={styles.modalDescription}>
                    Sélectionnez les personnalisations à inclure dans ce groupe.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCreateModal(false)}
                  activeOpacity={0.85}
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
                  placeholder="Ex: Base pizza"
                  placeholderTextColor={Colors.tgry}
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>

              <View style={styles.modalGrid}>
                <View style={styles.columnCard}>
                  <View style={styles.columnHeader}>
                    <View>
                      <Text style={styles.columnTitle}>
                        Personnalisations disponibles
                      </Text>
                      <Text style={styles.columnSubtitle}>
                        Cliquez pour ajouter au groupe
                      </Text>
                    </View>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>
                        {availableToppings.length}
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une personnalisation"
                    placeholderTextColor={Colors.tgry}
                    value={search}
                    onChangeText={setSearch}
                  />
                  <ScrollView
                    style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                    contentContainerStyle={styles.listContent}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredAvailable.length > 0 ? (
                      filteredAvailable.map((item) => (
                        <TouchableOpacity
                          key={item._id}
                          style={styles.sizeRow}
                          onPress={() => handleAdd(item._id)}
                          activeOpacity={0.9}
                        >
                          <Text style={styles.sizeName}>{item.name}</Text>
                          <View style={styles.sizeAction}>
                            <Entypo name="plus" size={18} color="#1b1b1b" />
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyListBox}>
                        <Text style={styles.emptyListTitle}>
                          {search
                            ? "Aucune personnalisation trouvée"
                            : "Aucune dispo"}
                        </Text>
                        <Text style={styles.emptyListSubtitle}>
                          {search
                            ? "Ajustez votre recherche"
                            : "Ajoutez des personnalisations avant de créer un groupe."}
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>

                <View style={styles.columnCard}>
                  <View style={styles.columnHeader}>
                    <View>
                      <Text style={styles.columnTitle}>
                        Personnalisations sélectionnées
                      </Text>
                      <Text style={styles.columnSubtitle}>
                        {selectedToppings.length} sélectionnée(s)
                      </Text>
                    </View>
                  </View>

                  <ScrollView
                    style={[styles.listScroll, { maxHeight: listMaxHeight }]}
                    contentContainerStyle={styles.listContent}
                    nestedScrollEnabled
                  >
                    {selectedToppingObjects.length > 0 ? (
                      selectedToppingObjects.map((item) => (
                        <TouchableOpacity
                          key={item._id}
                          style={styles.sizeRow}
                          onPress={() => handleRemove(item._id)}
                          activeOpacity={0.9}
                        >
                          <Text style={styles.sizeName}>{item.name}</Text>
                          <View
                            style={[styles.sizeAction, styles.removeAction]}
                          >
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
                          Aucune personnalisation sélectionnée
                        </Text>
                        <Text style={styles.emptyListSubtitle}>
                          Ajoutez des personnalisations à partir de la liste de
                          gauche.
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.checkboxRow}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => setRequired((r) => !r)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          required && styles.checkboxBoxOn,
                        ]}
                      >
                        {required && (
                          <Entypo name="check" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        Sélection requise
                      </Text>
                    </TouchableOpacity>
                    {required && (
                      <View style={styles.minMaxRow}>
                        <View style={styles.minMaxField}>
                          <Text style={styles.fieldLabel}>Min</Text>
                          <TextInput
                            style={styles.minMaxInput}
                            placeholder="1"
                            keyboardType="numeric"
                            value={minSelection}
                            onChangeText={setMinSelection}
                            placeholderTextColor={Colors.tgry}
                          />
                        </View>
                        <View style={styles.minMaxField}>
                          <Text style={styles.fieldLabel}>Max</Text>
                          <TextInput
                            style={styles.minMaxInput}
                            placeholder="Illimité"
                            keyboardType="numeric"
                            value={maxSelection}
                            onChangeText={setMaxSelection}
                            placeholderTextColor={Colors.tgry}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Text style={styles.selectionHelper}>
                  {selectedToppings.length} personnalisation(s) sélectionnée(s)
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={styles.ghostButton}
                    onPress={() => setShowCreateModal(false)}
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

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <BackButton />
        </View>

        <PageHeader
          title="Groupes de personnalisations"
          subtitle="Organisez vos options par groupe."
          pills={[{ label: `${groups.length} groupe(s)` }]}
          rightContent={
            <AddButton setShowModel={setShowCreateModal} text="Groupe" />
          }
        />

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { flex: 1.4 }]}>Groupe</Text>
            <Text style={[tableStyles.headerCell, { flex: 1 }]}>Règle</Text>
            <Text style={[tableStyles.headerCell, { flex: 2 }]}>
              Personnalisations
            </Text>
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
                  <Text style={[tableStyles.cell, { flex: 1 }]}>
                    {formatRule(group.selectionRule)}
                  </Text>
                  <Text
                    style={[tableStyles.cell, { flex: 2 }]}
                    numberOfLines={2}
                  >
                    {group.toppings?.map((t) => t.name).join(", ")}
                  </Text>
                  <View style={[tableStyles.actions, { width: 110, gap: 8 }]}>
                    <TouchableOpacity
                      style={[styles.actionIcon, styles.editActionIcon]}
                      onPress={() =>
                        navigation.navigate("ToppingGroup", { id: group._id })
                      }
                    >
                      <Ionicons name="pencil" size={18} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionIcon, styles.deleteActionIcon]}
                      onPress={() => handleShowDelete(group._id)}
                    >
                      <Ionicons name="trash" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun groupe</Text>
              <Text style={styles.emptySubtitle}>
                Créez un groupe pour commencer.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

export default ToppingGroupsScreen;

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
  backRow: {
    paddingLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
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
  checkboxRow: {
    marginTop: 10,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  minMaxRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignItems: "center",
  },
  minMaxField: {
    flex: 1,
    gap: 4,
  },
  minMaxInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "white",
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1b1b1b",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxBoxOn: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  checkboxLabel: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1b1b1b",
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
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  modalCreateButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
