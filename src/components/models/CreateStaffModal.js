import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts, Roles } from "../../constants";
import { Entypo } from "@expo/vector-icons";

import SuccessModel from "./SuccessModel";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import { API_URL } from "@env";
import { getRestaurants } from "../../services/RestaurantServices";
import FailModel from "./FailModel";

const CreateStaffModal = ({
  setShowCreateStaffModal,

  setRefresh,
}) => {
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [restaurant, setRestaurant] = useState({});
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFailModal, setShowFailModal] = useState(false);
  const [error, setError] = useState("");
  const roles = [
    { value: Roles.CASHIER, label: Roles.CASHIER },
    { value: Roles.MANAGER, label: Roles.MANAGER },
    { value: Roles.LIVREUR, label: Roles.LIVREUR },
  ];
  const fetchData = async () => {
    try {
      const response = await getRestaurants();
      if (response.status) {
        let list = [];
        response?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setRestaurants(list);
      }
    } catch (error) {}
    setIsLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const saveItem = async () => {
    if (name.length < 1) {
      setError("Nom de l'employée manquant");
      return;
    }
    if (username.length < 1) {
      setError("Nom d'utilisateur de l'employée manquant");
      return;
    }
    if (password.length < 1) {
      setError("Mot de passe de l'employée manquant");
      return;
    }
    if (Object.keys(restaurant).length < 1) {
      setError("Il faut choisir un restaurant");
      return;
    }
    if (role.length < 1) {
      setError("Il faut choisir un rôle");
      return;
    }

    const formdata = new FormData();
    if (image.length > 0) {
      formdata.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
      });
    }

    formdata.append("name", name);
    formdata.append("username", username);
    formdata.append("password", password);
    formdata.append("restaurant", restaurant.id);
    formdata.append("role", role);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/staffs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formdata,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      setShowSuccessModel(true);
    } catch (err) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setRefresh((prev) => prev + 1);
        setShowSuccessModel(false);
        setShowCreateStaffModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModal) {
      // After 1 second, reset showSuccessModel to false

      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts before 1 second
    }
  }, [showFailModal]);
  return (
    <View style={styles.container}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      {isLoading && (
        <View
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            width: "100%",
            height: "100%",
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <ActivityIndicator size={"large"} color="black" />
        </View>
      )}
      <View style={styles.model}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
            Ajouter un emplyée
          </Text>
          <TouchableOpacity onPress={() => setShowCreateStaffModal(false)}>
            <AntDesign name="close" size={40} color="gray" />
          </TouchableOpacity>
        </View>
        {error.length > 0 && (
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 20,
              textAlign: "center",
              color: "red",
            }}
          >
            {error}
          </Text>
        )}
        <View style={{ flexDirection: "row", marginTop: 40 }}>
          <TouchableOpacity
            style={{
              width: 150,
              height: 150,
              borderRadius: 16,
              backgroundColor: "gray",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={pickImage}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  resizeMode: "cover",
                  width: "100%",
                  height: "100%",
                  borderRadius: 16,
                }}
              />
            ) : (
              <Entypo name="camera" size={38} color="black" />
            )}
          </TouchableOpacity>
          <View
            style={{ marginLeft: 40, justifyContent: "space-between", flex: 1 }}
          >
            <View style={styles.name}>
              <Text style={styles.text}>Nom</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingBottom: 5,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  marginLeft: 20,
                  flex: 1,
                }}
                placeholder="Nom"
                placeholderTextColor={Colors.tgry}
                onChangeText={(text) => setName(text)}
              />
            </View>
            <View style={styles.name}>
              <Text style={styles.text}>Nom d'utilisateur</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingBottom: 5,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  marginLeft: 20,
                  flex: 1,
                }}
                placeholder="Nom d'utilisateur"
                placeholderTextColor={Colors.tgry}
                onChangeText={(text) => setUsername(text)}
              />
            </View>
            <View style={styles.name}>
              <Text style={styles.text}>Mot de passe</Text>
              <TextInput
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  paddingBottom: 5,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  marginLeft: 20,
                  flex: 1,
                }}
                placeholder="Mot de passe"
                placeholderTextColor={Colors.tgry}
                onChangeText={(text) => setPassword(text)}
              />
            </View>
          </View>
        </View>
        <View
          style={{
            marginTop: 40,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={styles.name}>
            <Text style={styles.text}>Réstaurant</Text>
            <Dropdown
              style={[styles.dropdown, { width: 300 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              selectedStyle={styles.selectedStyle}
              itemContainerStyle={styles.itemContainerStyle}
              itemTextStyle={styles.itemTextStyle}
              containerStyle={styles.containerStyle}
              data={restaurants}
              maxHeight={300}
              labelField="label"
              valueField="label"
              placeholder="Réstaurant"
              value={restaurant.name}
              onChange={(item) => {
                setRestaurant({ id: item.value, name: item.label });
              }}
            />
          </View>
          <View style={styles.name}>
            <Text style={styles.text}>Rôle</Text>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              selectedStyle={styles.selectedStyle}
              itemContainerStyle={styles.itemContainerStyle}
              itemTextStyle={styles.itemTextStyle}
              containerStyle={styles.containerStyle}
              data={roles}
              maxHeight={300}
              labelField="label"
              valueField="label"
              placeholder="Rôle"
              value={role}
              onChange={(item) => {
                setRole(item.value);
              }}
            />
          </View>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 60,
            alignSelf: "flex-end",
            backgroundColor: Colors.primary,
            paddingHorizontal: 60,
            paddingVertical: 10,
            borderRadius: 5,
          }}
          onPress={saveItem}
        >
          <Text style={styles.text}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateStaffModal;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(50,44,44,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  model: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "85%",
  },
  image: { flexDirection: "row", marginTop: 40, alignItems: "center" },
  text: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 20,
  },
  name: {
    flexDirection: "row",

    alignItems: "center",
  },

  dropdown: {
    height: 40,
    width: 200,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 20,
  },
  selectedStyle: {
    height: 18,
  },
  icon: {
    marginRight: 5,
  },
  itemContainerStyle: {
    padding: 0,
    margin: 0,
  },
  itemTextStyle: {
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 20,
    fontFamily: Fonts.LATO_REGULAR,
  },

  prices: { flexDirection: "row", alignItems: "center" },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
    padding: 6,
    marginLeft: 20,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});
