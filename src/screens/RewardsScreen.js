import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateRewardModel from "../components/models/CreateRewardModel";
import { deleteReward, getRewards } from "../services/RewardServices";
import ErrorScreen from "../components/ErrorScreen";
import PageHeader from "../components/ui/PageHeader";
import { Card, tableStyles } from "../components/ui/Surface";
const RewardsScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateRewardModel, setShowCreateRewardModel] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [rewardId, setRewardId] = useState(0);
  const [error, setError] = useState(false);
  const [rewardsList, setRewardsList] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getRewards();

      if (response.status) {
        setRewards(response.data);
        setRewardsList(response.data);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleShowDeleteWarning = (id) => {
    setRewardId(id);
    setDeleteWarningModelState(true);
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setRewards(rewardsList);
      return;
    }
    const filtered = rewardsList.filter((reward) => {
      const name = reward?.item?.name?.toLowerCase() || "";
      const points = `${reward.points ?? ""}`;
      return name.includes(query) || points.includes(query);
    });
    setRewards(filtered);
  };

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }
  return (
    <SafeAreaView style={styles.screen}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={rewardId}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setIsLoading={setIsLoading}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette récompense ?`}
          deleter={deleteReward}
        />
      )}
      {showCreateRewardModel && (
        <CreateRewardModel
          setShowCreateRewardModel={setShowCreateRewardModel}
          setRefresh={setRefresh}
        />
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Récompenses"
          subtitle="Gérez les points et leurs cadeaux."
          pills={[{ label: `${rewards.length} récompense(s)` }]}
          rightContent={
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Entypo name="magnifying-glass" size={18} color={Colors.mgry} />
                <TextInput
                  style={styles.searchField}
                  placeholder="Chercher par article"
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
                setShowModel={setShowCreateRewardModel}
                text="Récompense"
              />
            </View>
          }
        />

        <Card style={styles.tableCard}>
          <View style={tableStyles.header}>
            <Text style={[tableStyles.headerCell, { flex: 1.6 }]}>
              Article
            </Text>
            <Text style={[tableStyles.headerCell, { width: 100 }]}>
              Points
            </Text>
            <Text style={[tableStyles.headerCell, { width: 100 }]}>
              Actions
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : rewards.length > 0 ? (
            <ScrollView
              style={styles.tableScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
              }
            >
              {rewards.map((reward, index) => (
                <View
                  key={reward._id}
                  style={[
                    tableStyles.row,
                    index % 2 === 0 && tableStyles.rowAlt,
                  ]}
                >
                  <Text
                    style={[tableStyles.cell, { flex: 1.6 }]}
                    numberOfLines={1}
                  >
                    {reward?.item?.name}
                  </Text>
                  <Text style={[tableStyles.cell, { width: 100 }]}>
                    {reward.points}
                  </Text>

                  <View style={[tableStyles.actions, { width: 100 }]}>
                    <TouchableOpacity
                      style={tableStyles.iconButton}
                      onPress={() => handleShowDeleteWarning(reward._id)}
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
              <Text style={styles.emptyTitle}>Aucune Récompense</Text>
              <Text style={styles.emptySubtitle}>
                Ajoutez un article récompense pour démarrer.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RewardsScreen;

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
});
