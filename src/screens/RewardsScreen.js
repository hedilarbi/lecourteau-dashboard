import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { MaterialIcons } from "@expo/vector-icons";

import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";
import CreateRewardModel from "../components/models/CreateRewardModel";
import { deleteReward, getRewards } from "../services/RewardServices";
import ErrorScreen from "../components/ErrorScreen";
const RewardsScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateRewardModel, setShowCreateRewardModel] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [rewardId, setRewardId] = useState(0);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getRewards();

      if (response.status) {
        setRewards(response.data);
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

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }
  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
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
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Récompenses
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          <AddButton
            setShowModel={setShowCreateRewardModel}
            text="Récompense"
          />
        </View>
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
        ) : (
          <ScrollView style={{ width: "60%", marginTop: 30 }}>
            {rewards.map((reward, index) => (
              <View
                key={reward._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Text
                  style={[styles.rowCell, { width: "50%" }]}
                  numberOfLines={1}
                >
                  {reward?.item?.name}
                </Text>
                <Text style={[styles.rowCell]}>{reward.points}</Text>

                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(reward._id)}
                >
                  <MaterialIcons name="delete" size={24} color="#F31A1A" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RewardsScreen;

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
