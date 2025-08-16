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
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";

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

      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
            Utilisateurs
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                flexDirection: "row",
                width: 300,
                alignItems: "center",
                paddingBottom: 4,
                paddingTop: 4,
                paddingLeft: 4,

                borderWidth: 1,
                borderRadius: 5,
              }}
            >
              <Entypo name="magnifying-glass" size={24} color={Colors.mgry} />
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  marginLeft: 5,
                  flex: 1,
                }}
                placeholder="Chercher par nom"
                onChangeText={(text) => setSearch(text)}
                placeholderTextColor={Colors.mgry}
                value={search}
              />
            </View>
            <TouchableOpacity
              style={{
                marginLeft: 12,
                backgroundColor: Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={fetchData}
            >
              <Text style={{ color: "white" }}>Rechercher</Text>
            </TouchableOpacity>
          </View>
        </View>

        {users?.length > 0 ? (
          <ScrollView
            style={{
              width: "100%",
              marginTop: 30,
              borderWidth: 1,
              borderColor: "black",
            }}
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
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowBanWarning(user)}
                >
                  <Entypo
                    name="block"
                    size={24}
                    color={user.isBanned ? "green" : "#F31A1A"}
                  />
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
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text
            style={{
              fontFamily: Fonts.LATO_REGULAR,
              fontSize: 20,
            }}
          >
            {"Page " + page + (pages > 0 ? "/" + pages : "")}
          </Text>
        </View>
        <View
          style={{
            marginTop: 16,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View>
            <TouchableOpacity
              onPress={() => setPage((prev) => prev - 1)}
              style={{
                backgroundColor: page <= 1 ? "gray" : Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              disabled={page <= 1}
            >
              <Text style={{ color: "white" }}>Précédent</Text>
            </TouchableOpacity>
          </View>
          {pages > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,

                  width: 100,
                  borderWidth: 1,
                  borderRadius: 5,
                  padding: 5,
                  borderColor: Colors.mgry,
                }}
                placeholder="Page"
                onChangeText={(text) => setNavigaTo(text)}
                placeholderTextColor={Colors.mgry}
                keyboardType="numeric"
                value={navigaTo}
              />
              <TouchableOpacity
                style={{
                  marginLeft: 12,
                  backgroundColor: Colors.primary,
                  padding: 10,
                  borderRadius: 10,
                }}
                onPress={() => {
                  setPage(parseInt(navigaTo));
                  setNavigaTo("");
                }}
              >
                <Text style={{ color: "white" }}>Rechercher</Text>
              </TouchableOpacity>
            </View>
          )}

          <View>
            <TouchableOpacity
              onPress={() => setPage((prev) => prev + 1)}
              style={{
                backgroundColor: page >= pages ? "gray" : Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              disabled={page >= pages}
            >
              <Text style={{ color: "white" }}>Suivant</Text>
            </TouchableOpacity>
          </View>
        </View>
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
