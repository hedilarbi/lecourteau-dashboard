import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { Colors, Fonts } from "../constants";
import SearchBar from "../components/SearchBar";
import DeleteWarning from "../components/models/DeleteWarning";
import UserModel from "../components/models/UserModel";
import useGetUsers from "../hooks/useGetUsers";
import { deleteUser, getUsers } from "../services/UsersServices";
import { filterUsers } from "../utils/filters";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const UsersScreen = () => {
  const navigation = useNavigation();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [userId, setUserId] = useState("");
  const [refresh, setRefresh] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const fetchData = async () => {
    getUsers().then((response) => {
      if (response?.status) {
        setUsers(response?.data);
        setUsersList(response?.data);
      } else {
        console.log("getUsers false");
      }
    });
  };
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  }, [refresh]);
  const handleShowUserModel = (id) => {
    navigation.navigate("User", { id });
  };

  const handleShowDeleteWarning = (id) => {
    setUserId(id);
    setDeleteWarningModelState(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
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

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Utilisateurs
        </Text>
        <View style={{ marginTop: 30 }}>
          <SearchBar setter={setUsers} list={usersList} filter={filterUsers} />
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
        ) : users.length > 0 ? (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {users.map((user, index) => (
              <View
                key={user._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Text style={[styles.rowCell, { width: "20%" }]}>
                  {user.name}
                </Text>
                <Text style={[styles.rowCell, { width: "20%" }]}>
                  {user.phone_number}
                </Text>
                <Text style={[styles.rowCell, { flex: 1 }]}>{user.email}</Text>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowUserModel(user._id)}
                >
                  <FontAwesome name="pencil" size={24} color="#2AB2DB" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(user._id)}
                >
                  <MaterialIcons name="delete" size={24} color="#F31A1A" />
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
              Aucun Utilisateur
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  rowCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 20,
  },
});

export default UsersScreen;
