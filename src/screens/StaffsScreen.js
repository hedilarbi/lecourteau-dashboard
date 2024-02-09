import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../constants";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import AddButton from "../components/AddButton";

import {
  deleteRestaurant,
  getRestaurants,
} from "../services/RestaurantServices";
import CreateRestaurantModal from "../components/models/CreateRestaurantModal";
import { deleteStaffMember, getStaffMembers } from "../services/StaffServices";
import CreateStaffModal from "../components/models/CreateStaffModal";

const StaffsScreen = () => {
  const navigation = useNavigation();
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [staffs, setStaffs] = useState([]);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [staffId, setStaffId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    getStaffMembers()
      .then((response) => {
        if (response.status) {
          setStaffs(response.data);
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

  useEffect(() => {
    fetchData();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
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

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Employé
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          {/* <SearchBar /> */}
          <AddButton setShowModel={setShowCreateStaffModal} text="Employée" />
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
        ) : staffs.length > 0 ? (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {staffs.map((staff, index) => (
              <View
                key={staff._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Text style={[styles.rowCell, { width: "30%" }]}>
                  {staff.name}
                </Text>
                <Text
                  style={[styles.rowCell, { width: "30%" }]}
                  numberOfLines={1}
                >
                  {staff.role}
                </Text>

                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() =>
                    navigation.navigate("Employee", { id: staff._id })
                  }
                >
                  <FontAwesome name="pencil" size={30} color="#2AB2DB" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(staff._id)}
                >
                  <MaterialIcons name="delete" size={30} color="#F31A1A" />
                </TouchableOpacity>
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
              Aucun Employée
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default StaffsScreen;

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
    width: 200,
    height: 150,
    resizeMode: "cover",
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 22,
  },
});
