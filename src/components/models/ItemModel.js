import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import useGetOrder from "../../hooks/useGetOrder";
import { getMenuItem } from "../../services/MenuItemServices";
import { Col } from "react-native-table-component";

const ItemModel = ({ setShowMenuItemModel, id }) => {
  const [menuItem, setMenuItem] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [categorizedList, setCategorizedList] = useState([]);
  const groupByCategory = (originalArray) => {
    const groupedByCategoryArray = originalArray.reduce(
      (accumulator, currentObject) => {
        const categoryName = currentObject.category.name;
        const existingCategory = accumulator.find(
          (category) => category.name === categoryName
        );

        if (existingCategory) {
          existingCategory.products.push(currentObject);
        } else {
          accumulator.push({
            name: categoryName,
            products: [currentObject],
          });
        }

        return accumulator;
      },
      []
    );

    return groupedByCategoryArray;
  };
  const fetchData = async () => {
    getMenuItem(id)
      .then((response) => {
        if (response.status) {
          setMenuItem(response.data);
          setCategorizedList(groupByCategory(response.data.customization));
        } else {
          console.log(response);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.model}>
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => setShowMenuItemModel(false)}
        >
          <AntDesign name="close" size={40} color="gray" />
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
        ) : (
          <>
            <View
              style={{ flexDirection: "row", alignItems: "", marginTop: 40 }}
            >
              <Image style={styles.image} source={{ uri: menuItem.image }} />
              <View style={styles.infoContainer}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.title}>Name:</Text>
                  <Text style={styles.infoContent}>{menuItem.name}</Text>
                </View>
                <View style={[styles.infoTextContainer, { marginVertical: 5 }]}>
                  <Text style={styles.title}>Category:</Text>
                  <Text style={styles.infoContent}>
                    {menuItem.category.name}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.title, { fontFamily: Fonts.LATO_BOLD }]}>
                    Prices:
                  </Text>
                  {menuItem.prices.map((item) => (
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.title}>{item.size} : </Text>
                      <Text style={styles.infoContent}>{item.price} $</Text>
                    </View>
                  ))}
                </View>
                <View style={{}}>
                  <Text style={[styles.title, { marginVertical: 10 }]}>
                    Customizations:
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap  " }}>
                    {categorizedList.map((item) => (
                      <View style={{}}>
                        <Text style={styles.title}>{item.name}</Text>
                        {item.products.map((product) => {
                          return (
                            <View
                              style={{
                                backgroundColor: Colors.primary,
                                paddingHorizontal: 30,
                                paddingVertical: 10,
                                borderRadius: 20,
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 20,
                                width: "100",
                              }}
                            >
                              <Text
                                style={[styles.infoContent, { marginLeft: 0 }]}
                              >
                                {product.name}
                              </Text>

                              <TouchableOpacity
                                style={{}}
                                //onPress={() => setShowOrderModel(false)}
                              >
                                <AntDesign
                                  name="close"
                                  size={24}
                                  color="black"
                                />
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default ItemModel;

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
    width: "80%",
    alignItems: "",
    justifyContent: "flex-start",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 5,
    resizeMode: "cover",
  },
  infoContainer: { marginLeft: 40 },
  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontFamily: Fonts.LATO_REGULAR, fontSize: 24 },
  infoContent: { fontFamily: Fonts.LATO_REGULAR, fontSize: 20, marginLeft: 20 },

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
