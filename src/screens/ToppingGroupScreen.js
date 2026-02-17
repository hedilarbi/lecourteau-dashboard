import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import BackButton from "../components/BackButton";
import PageHeader from "../components/ui/PageHeader";
import { getToppingGroup, updateToppingGroup } from "../services/ToppingGroupsServices";
import { getToppings } from "../services/ToppingsServices";
import ErrorScreen from "../components/ErrorScreen";
import { Entypo } from "@expo/vector-icons";

const ToppingGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [group, setGroup] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [required, setRequired] = useState(false);
  const [minSelection, setMinSelection] = useState("");
  const [maxSelection, setMaxSelection] = useState("");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [groupRes, toppingsRes] = await Promise.all([
        getToppingGroup(id),
        getToppings(),
      ]);
      if (groupRes?.status) {
        setGroup(groupRes.data);
        setName(groupRes.data.name || "");
        setSelected(groupRes.data.toppings?.map((t) => t._id) || []);
        setRequired(!!groupRes.data.required);
        setMinSelection(
          groupRes.data.minSelection || groupRes.data.minSelection === 0
            ? String(groupRes.data.minSelection)
            : ""
        );
        setMaxSelection(
          groupRes.data.maxSelection || groupRes.data.maxSelection === 0
            ? String(groupRes.data.maxSelection)
            : ""
        );
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
  }, [id]);

  const toppingMap = useMemo(() => {
    const map = new Map();
    toppings.forEach((t) => map.set(t._id, t));
    return map;
  }, [toppings]);

  const available = useMemo(
    () => toppings.filter((t) => !selected.includes(t._id)),
    [toppings, selected]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredAvailable = useMemo(
    () =>
      normalizedSearch
        ? available.filter((t) => t.name.toLowerCase().includes(normalizedSearch))
        : available,
    [available, normalizedSearch]
  );

  const selectedObjects = useMemo(
    () => selected.map((id) => toppingMap.get(id)).filter(Boolean),
    [selected, toppingMap]
  );

  const handleAdd = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemove = (id) => {
    setSelected((prev) => prev.filter((t) => t !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Nom requis");
      return;
    }
    if (selected.length === 0) {
      setFormError("Ajoutez au moins une personnalisation");
      return;
    }
    let parsedMin = null;
    let parsedMax = null;
    if (required) {
      parsedMin = minSelection === "" ? null : parseInt(minSelection, 10);
      parsedMax = maxSelection === "" ? null : parseInt(maxSelection, 10);
      if (parsedMin === null || Number.isNaN(parsedMin) || parsedMin < 1) {
        setFormError("Indiquez un minimum valide (≥1) pour une sélection requise");
        return;
      }
      if (parsedMax !== null && (Number.isNaN(parsedMax) || parsedMax < parsedMin)) {
        setFormError("Le maximum doit être supérieur ou égal au minimum");
        return;
      }
    }
    setFormError("");
    setIsLoading(true);
    const payload = {
      name: name.trim(),
      toppings: selected,
      selectionRule: {
        isRequired: required,
        min: parsedMin,
        max: parsedMax,
      },
    };
    const response = await updateToppingGroup(id, payload);
    setIsLoading(false);
    if (response?.status) {
      navigation.goBack();
    } else {
      setFormError(response?.message || "Erreur lors de la mise à jour");
    }
  };

  if (error) {
    return <ErrorScreen setRefresh={fetchData} />;
  }

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size={"large"} color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.backRow}>
        <BackButton />
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Modifier le groupe"
          subtitle="Ajustez le nom et les personnalisations du groupe."
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nom du groupe</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom du groupe"
              placeholderTextColor={Colors.tgry}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.modalGrid}>
            <View style={styles.columnCard}>
              <View style={styles.columnHeader}>
                <View>
                  <Text style={styles.columnTitle}>Disponibles</Text>
                  <Text style={styles.columnSubtitle}>
                    Cliquez pour ajouter au groupe
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{available.length}</Text>
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
                style={styles.listScroll}
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
                      {search ? "Aucune personnalisation trouvée" : "Aucune dispo"}
                    </Text>
                    <Text style={styles.emptyListSubtitle}>
                      {search ? "Ajustez votre recherche" : "Ajoutez de nouvelles options."}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.columnCard}>
              <View style={styles.columnHeader}>
                <View>
                  <Text style={styles.columnTitle}>Sélectionnées</Text>
                  <Text style={styles.columnSubtitle}>
                    {selected.length} sélectionnée(s)
                  </Text>
                </View>
              </View>
              <ScrollView
                style={styles.listScroll}
                contentContainerStyle={styles.listContent}
                nestedScrollEnabled
              >
                {selectedObjects.length > 0 ? (
                  selectedObjects.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      style={styles.sizeRow}
                      onPress={() => handleRemove(item._id)}
                    >
                      <Text style={styles.sizeName}>{item.name}</Text>
                      <View style={[styles.sizeAction, styles.removeAction]}>
                        <Entypo name="minus" size={18} color={Colors.danger} />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyListBox}>
                    <Text style={styles.emptyListTitle}>Aucune sélection</Text>
                    <Text style={styles.emptyListSubtitle}>
                      Ajoutez des personnalisations à partir de la liste de gauche.
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
                  <View style={[styles.checkboxBox, required && styles.checkboxBoxOn]}>
                    {required && <Entypo name="check" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Sélection requise</Text>
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
              {selected.length} personnalisation(s) sélectionnée(s)
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.goBack()}>
                <Text style={styles.ghostLabel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.modalCreateButton]}
                onPress={handleSave}
              >
                <Text style={styles.primaryLabel}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ToppingGroupScreen;

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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.screenBg,
  },
  formError: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 6,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
    gap: 14,
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
  },
  columnCard: {
    flex: 1,
    minWidth: 280,
    minHeight: 360,
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
    height: 360,
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
