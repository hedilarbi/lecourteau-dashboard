import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Colors, Fonts } from "../constants";

import axios from "axios";
import { API_URL } from "@env";
import { Dropdown } from "react-native-element-dropdown";
import { getItemsNames } from "../services/MenuItemServices";
const SendNotifications = ({
  setIsLoading,
  setShowSuccessModel,
  setShowFailModal,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [item, setItem] = useState({});
  const itemRef = useRef(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const response = await getItemsNames();
      if (response.status) {
        let list = [{ value: "", label: "Aucun" }];
        response.data.map((item) => {
          list.push({ value: item._id, label: item.name });
        });
        setMenuItems(list);
      }
    } catch (err) {
    } finally {
      setDataLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const send = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/notifiers/notifications`, {
        title,
        body,
        item: item._id,
      });

      if (response.status === 200) {
        setTitle("");
        setBody("");
        setShowSuccessModel(true);
      }
    } catch (err) {
      console.log(err);
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  if (dataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 24 }}>
        Envoyer des notifications
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 50 }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>Titre</Text>
        <TextInput
          placeholder="Titre"
          style={{
            padding: 10,
            fontFamily: Fonts.LATO_REGULAR,
            fontSize: 20,
            flex: 1,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginLeft: 20,
            color: "black",
          }}
          onChangeText={(text) => setTitle(text)}
          value={title}
        />
      </View>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 50 }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
          Message
        </Text>
        <TextInput
          placeholder="Message"
          style={{
            padding: 10,
            fontFamily: Fonts.LATO_REGULAR,
            fontSize: 20,
            flex: 1,
            borderWidth: 2,
            borderColor: Colors.primary,
            marginLeft: 20,
            color: "black",
          }}
          onChangeText={(text) => setBody(text)}
          value={body}
        />
      </View>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 50 }}
      >
        <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
          Article (optionnel)
        </Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          selectedStyle={styles.selectedStyle}
          itemContainerStyle={styles.itemContainerStyle}
          itemTextStyle={styles.itemTextStyle}
          containerStyle={styles.containerStyle}
          data={menuItems}
          maxHeight={300}
          labelField="label"
          valueField="label"
          placeholder="Choisir un article"
          value={item.name}
          ref={itemRef}
          onChange={(item) => setItem({ _id: item.value, name: item.label })}
        />
      </View>
      <TouchableOpacity
        style={{
          marginTop: 80,
          alignSelf: "flex-end",
          backgroundColor: Colors.primary,
          paddingHorizontal: 60,
          paddingVertical: 10,
          borderRadius: 5,
        }}
        onPress={send}
      >
        <Text
          style={{
            fontFamily: Fonts.LATO_BOLD,
            fontSize: 20,
          }}
        >
          Envoyer
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendNotifications;

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    width: 300,
    borderColor: Colors.primary,
    borderWidth: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 40,
    marginVertical: 20,
  },
  selectedStyle: {
    height: 18,
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
});
