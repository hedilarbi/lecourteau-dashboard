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
        response.data.map((menuItem) => {
          list.push({ value: menuItem._id, label: menuItem.name });
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
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Envoyer des notifications</Text>
        <Text style={styles.subtitle}>
          Composez un titre, un message et choisissez un article.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          placeholder="Titre"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setTitle(text)}
          value={title}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          placeholder="Message"
          style={[styles.input, styles.textArea]}
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setBody(text)}
          value={body}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Article (optionnel)</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
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
          onChange={(selected) =>
            setItem({ _id: selected.value, name: selected.label })
          }
        />
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={send}>
        <Text style={styles.sendLabel}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendNotifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 22,
    color: "#111827",
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#6B7280",
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    backgroundColor: Colors.gry,
    color: "#111827",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  dropdown: {
    height: 46,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.gry,
  },
  itemContainerStyle: {
    paddingVertical: 8,
  },
  itemTextStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_REGULAR,
    color: "#111827",
  },
  containerStyle: {
    marginTop: -25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_REGULAR,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 15,
    fontFamily: Fonts.LATO_BOLD,
    color: "#111827",
  },
  sendButton: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sendLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
