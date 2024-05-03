import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import DeleteWarning from "../components/models/DeleteWarning";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native-gesture-handler";
import { Colors, Fonts } from "../constants";
import { MaterialIcons } from "@expo/vector-icons";
import CreateSizeModal from "../components/models/CreateSizeModal";
import { deleteSize, getSizes } from "../services/SizesServices";
import { useFocusEffect } from "@react-navigation/native";

const SizesScreen = () => {
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [showCreateSizeModel, setShowCreateSizeModel] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState("");
  const [sizes, setSizes] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    getSizes()
      .then((response) => {
        if (response?.status) {
          setSizes(response?.data);
        } else {
          console.log("error");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetchData();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleShowDeleteWarning = (id) => {
    setSize(id);
    setDeleteWarningModelState(true);
  };
  return (
    <SafeAreaView style={{ backgroundColor: Colors.screenBg, flex: 1 }}>
      {deleteWarningModelState && (
        <DeleteWarning
          id={size}
          setDeleteWarningModelState={setDeleteWarningModelState}
          setRefresh={setRefresh}
          message={`Etes-vous sûr de vouloir supprimer cette taille ?`}
          deleter={deleteSize}
        />
      )}

      {showCreateSizeModel && (
        <CreateSizeModal
          setShowCreateSizeModel={setShowCreateSizeModel}
          setRefresh={setRefresh}
        />
      )}

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontFamily: Fonts.BEBAS_NEUE, fontSize: 40 }}>
          Tailles
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
            borderWidth: 1,
            borderRadius: 5,
            flexDirection: "row",
            alignItems: "center",
            width: "30%",
            justifyContent: "center",
            marginTop: 20,
          }}
          onPress={() => setShowCreateSizeModel(true)}
        >
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
              color: "black",
              marginLeft: 10,
            }}
          >
            creer une taille
          </Text>
        </TouchableOpacity>
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
        ) : sizes.length > 0 ? (
          <ScrollView
            style={{ width: "100%", marginTop: 30 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
            }
          >
            {sizes.map((item, index) => (
              <View
                key={item._id}
                style={[
                  styles.row,
                  index % 2
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "rgba(247,166,0,0.3)" },
                ]}
              >
                <Text style={[styles.rowCell, { flex: 1 }]}>{item.name}</Text>

                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleShowDeleteWarning(item._id)}
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
              Aucune Tailles
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SizesScreen;
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
