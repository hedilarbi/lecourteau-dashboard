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

import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts, OrderStatus } from "../constants";
import { Entypo } from "@expo/vector-icons";
import useGetOrder from "../hooks/useGetOrder";
import { convertDate } from "../utils/dateHandlers";
import { useRoute } from "@react-navigation/native";
import { Foundation } from "@expo/vector-icons";
import {
  updatePaymentStatus,
  updatePrice,
  updateStatus,
} from "../services/OrdersServices";
import SuccessModel from "../components/models/SuccessModel";
import FailModel from "../components/models/FailModel";
import ErrorScreen from "../components/ErrorScreen";

const OrderScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const {
    order,
    isLoading,
    setIsLoading,
    setOrder,
    error,
    setRefresh,
    tvq,
    tps,
  } = useGetOrder(id);

  const [updateStatusMode, setUpdateStatusMode] = useState(false);
  const [updatePriceMode, setUpdatePriceMode] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");

  const [driversList, setDriversList] = useState([]);
  const [driver, setDriver] = useState({});
  const [updateDriverMode, setUpdateDriverMode] = useState(false);
  const [payment_status, setPaymentStatus] = useState(null);

  const statusOptions = [
    { label: OrderStatus.READY, value: OrderStatus.READY },
    { label: OrderStatus.DONE, value: OrderStatus.DONE },
    { label: OrderStatus.IN_DELIVERY, value: OrderStatus.IN_DELIVERY },

    { label: OrderStatus.CANCELED, value: OrderStatus.CANCELED },
  ];
  const setOrderStatusColor = (status) => {
    switch (status) {
      case OrderStatus.READY:
        return "#2AB2DB";
      case OrderStatus.DONE:
        return "#2AB2DB";
      case OrderStatus.IN_DELIVERY:
        return "#2AB2DB";
      case OrderStatus.CANCELED:
        return "#FF0707";
    }
  };
  useEffect(() => {
    if (showFailModal) {
      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModal]);

  const updateOrderStatus = async () => {
    setIsLoading(true);
    updateStatus(order._id, status)
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
          setUpdateStatusMode(false);
          setOrder({ ...order, status });
        } else {
          setShowFailModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const updateOrderPrice = async () => {
    setIsLoading(true);

    try {
      const response = await updatePrice(order._id, price);
      if (response.status) {
        setShowSuccessModel(true);
        setUpdatePriceMode(false);
        setOrder({ ...order, total_price: price });
      } else {
        setShowFailModal(true);
      }
    } catch (error) {
      setShowFailModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);

  const handleUpdateDriverMode = async () => {
    // setIsLoading(true);
    // try {
    //   const list = await getAvailableDrivers();

    //   const drivers = list.data.map((driver) => {
    //     return { label: driver.name, value: driver._id };
    //   });
    //   setDriversList(drivers);
    //   setIsLoading(false);
    //   setUpdateDriverMode(true);
    // } catch (err) {
    //   setIsLoading(false);
    // }
    setUpdateDriverMode(true);
  };

  // const updateDriver = async () => {
  //   setIsLoading(true);
  //   if (!driver.id) {
  //     setIsLoading(false);
  //     return;
  //   }
  //   try {
  //     const response = await affectOrderToStaff(order._id, driver.id);
  //     if (response.status) {
  //       setShowSuccessModel(true);
  //       setUpdateDriverMode(false);
  //       setOrder({ ...order, delivery_by: driver });
  //       setIsLoading(false);
  //     } else {
  //       setIsLoading(false);
  //     }
  //   } catch (err) {
  //     setIsLoading(false);
  //   }
  // };

  const handlePaymentStatus = async () => {
    setIsLoading(true);
    if (payment_status === null) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await updatePaymentStatus(order._id, payment_status);
      if (response.status) {
        setShowSuccessModel(true);
        setUpdateDriverMode(false);
        setOrder({ ...order, payment_status: payment_status });
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.screenBg,
        }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen setRefresh={setRefresh} />;
  }
  return (
    <View style={{ flex: 1 }}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.screenBg }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginTop: 20,
              }}
            >
              Instructions
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                padding: 15,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 20,
                  marginLeft: 10,
                  textAlign: "center",
                }}
              >
                {order.instructions ? order.instructions : "Aucune"}
              </Text>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginTop: 20,
              }}
            >
              Articles
            </Text>

            {order.orderItems?.length > 0 ? (
              <ScrollView
                style={{
                  marginTop: 20,
                  backgroundColor: "white",
                }}
              >
                {order.orderItems?.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.row,
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Text
                      style={[styles.rowCell, { width: "20%" }]}
                      numberOfLines={2}
                    >
                      {item.item.name}
                    </Text>
                    <Text
                      style={[styles.rowCell, { width: "15%" }]}
                      numberOfLines={3}
                    >
                      {item.comment || ""}
                    </Text>
                    <Text style={[styles.rowCell, { width: "10%" }]}>
                      {item.size}
                    </Text>

                    <Text style={[styles.rowCell, { flex: 1 }]}>
                      {item.customizations?.map((custo) => {
                        return custo.name + "/";
                      })}
                    </Text>
                    <Text style={[styles.rowCell, { width: "15%" }]}>
                      {item.price.toFixed(2)} $
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Vide
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginTop: 20,
              }}
            >
              Offres
            </Text>

            {order.offers?.length > 0 ? (
              <ScrollView
                style={{
                  marginTop: 20,
                  backgroundColor: "white",
                }}
              >
                {order.offers?.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      {
                        width: "100%",
                        flexDirection: "row",
                        gap: 50,
                        alignItems: "center",

                        paddingVertical: 12,
                        paddingHorizontal: 10,
                      },
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Text style={[styles.rowCell]} numberOfLines={1}>
                      {item.offer?.name}
                    </Text>
                    <View>
                      {item.items?.map((offerItem, index) => (
                        <View style={{ flexDirection: "row" }} key={index}>
                          <Text
                            style={[styles.rowCell]}
                            numberOfLines={2}
                            key={index}
                          >
                            {offerItem.item.name}
                          </Text>

                          <Text style={{ marginLeft: 10 }}>(</Text>
                          {offerItem.customizations?.map((custo, i) => {
                            return (
                              <Text
                                style={{
                                  fontFamily: Fonts.LATO_REGULAR,
                                  fontSize: 20,
                                }}
                                key={i}
                              >
                                {custo.name},{" "}
                              </Text>
                            );
                          })}
                          <Text>)</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={[styles.rowCell]} numberOfLines={1}>
                      {item.offer?.price.toFixed(2)} $
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Vide
                </Text>
              </View>
            )}
          </View>

          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginTop: 20,
              }}
            >
              Récompense
            </Text>

            {order.rewards?.length > 0 ? (
              <ScrollView
                style={{
                  marginTop: 20,
                  backgroundColor: "white",
                }}
              >
                {order.rewards?.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.row,
                      index % 2
                        ? { backgroundColor: "transparent" }
                        : { backgroundColor: "rgba(247,166,0,0.3)" },
                    ]}
                  >
                    <Text style={[styles.rowCell]} numberOfLines={1}>
                      {item.item.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Vide
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginVertical: 10,
              }}
            >
              Informations générale
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 / 2 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Etat:
                    </Text>
                    {updateStatusMode ? (
                      <>
                        <Dropdown
                          style={[styles.dropdown]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          selectedStyle={styles.selectedStyle}
                          itemContainerStyle={styles.itemContainerStyle}
                          itemTextStyle={styles.itemTextStyle}
                          containerStyle={styles.containerStyle}
                          data={statusOptions}
                          maxHeight={300}
                          labelField="label"
                          valueField="label"
                          placeholder={order.status}
                          value={status}
                          onChange={(item) => setStatus(item.label)}
                        />
                        <TouchableOpacity
                          style={{
                            marginRight: 15,
                            backgroundColor: Colors.primary,
                            borderRadius: 5,
                            alignItems: "center",
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                          }}
                          onPress={updateOrderStatus}
                        >
                          <Text style={{ fontFamily: Fonts.LATO_BOLD }}>
                            Entregistrer
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text
                          style={{
                            fontFamily: Fonts.LATO_REGULAR,
                            fontSize: 20,
                            marginLeft: 10,
                            flex: 1,
                            color: setOrderStatusColor(order.status),
                          }}
                        >
                          {order.status}
                        </Text>
                        <TouchableOpacity
                          style={{ marginRight: 15 }}
                          onPress={() => setUpdateStatusMode(true)}
                        >
                          <Foundation
                            name="pencil"
                            size={28}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  {/* {order.payment_status !== undefined &&
                    order.payment_method !== "card" && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.LATO_BOLD,
                            fontSize: 20,
                          }}
                        >
                          Etat du paiement:
                        </Text>
                        {updateDriverMode ? (
                          <>
                            <Dropdown
                              style={[styles.dropdown]}
                              placeholderStyle={styles.placeholderStyle}
                              selectedTextStyle={styles.selectedTextStyle}
                              selectedStyle={styles.selectedStyle}
                              itemContainerStyle={styles.itemContainerStyle}
                              itemTextStyle={styles.itemTextStyle}
                              containerStyle={styles.containerStyle}
                              data={[
                                { label: "Payé", value: true },
                                { label: "Non payé", value: false },
                              ]}
                              maxHeight={300}
                              labelField="label"
                              valueField="label"
                              value={
                                order.payment_status === true
                                  ? "Payé"
                                  : "Non payé"
                              }
                              onChange={(item) => setPaymentStatus(item.value)}
                            />
                            <TouchableOpacity
                              style={{
                                marginRight: 15,
                                backgroundColor: Colors.primary,
                                borderRadius: 5,
                                alignItems: "center",
                                paddingHorizontal: 15,
                                paddingVertical: 5,
                              }}
                              onPress={handlePaymentStatus}
                            >
                              <Text style={{ fontFamily: Fonts.LATO_BOLD }}>
                                Entregistrer
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <Text
                              style={{
                                fontFamily: Fonts.LATO_REGULAR,
                                fontSize: 20,
                                marginLeft: 10,
                                flex: 1,
                                color: "black",
                              }}
                            >
                              {order.payment_status === true
                                ? "Payé"
                                : "Non payé"}
                            </Text>
                            <TouchableOpacity
                              style={{ marginRight: 15 }}
                              onPress={handleUpdateDriverMode}
                            >
                              <Foundation
                                name="pencil"
                                size={28}
                                color={Colors.primary}
                              />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )} */}
                  {/* {order.payment_status !== undefined &&
                    order.payment_method === "card" && (
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.LATO_BOLD,
                            fontSize: 20,
                          }}
                        >
                          Etat du paiement:
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.LATO_REGULAR,
                            fontSize: 20,
                            marginLeft: 10,
                          }}
                        >
                          {order.payment_status === true ? "Payé" : "Non payé"}{" "}
                        </Text>
                      </View>
                    )} */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Code:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.code}
                    </Text>
                  </View>
                  {/* <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Methode de paiement
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.payment_method === "cash" ? "Espèce" : "Carte"}
                    </Text>
                  </View> */}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Type
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.type === "delivery" ? "Livraison" : "Emporter"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Crée le:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {convertDate(order.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Nombre d'article:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.orderItems?.length +
                        order.offers?.length +
                        order.rewards?.length}{" "}
                      article(s)
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 / 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Totale:
                    </Text>
                    {updatePriceMode ? (
                      <>
                        <TextInput
                          style={{
                            fontFamily: Fonts.LATO_REGULAR,
                            fontSize: 20,
                            borderWidth: 1,
                            paddingHorizontal: 5,
                            paddingVertical: 2,
                            marginLeft: 10,
                            borderRadius: 5,
                            flex: 1,
                          }}
                          keyboardType="numeric"
                          placeholder={parseFloat(order.total_price).toFixed(2)}
                          onChangeText={(text) => setPrice(text)}
                        />
                        <TouchableOpacity
                          style={{
                            marginRight: 15,
                            marginLeft: 10,
                            backgroundColor: Colors.primary,
                            borderRadius: 5,
                            alignItems: "center",
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                          }}
                          onPress={updateOrderPrice}
                        >
                          <Text style={{ fontFamily: Fonts.LATO_BOLD }}>
                            Entregistrer
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text
                          style={{
                            fontFamily: Fonts.LATO_REGULAR,
                            fontSize: 20,
                            marginLeft: 10,
                            flex: 1,
                          }}
                        >
                          {parseFloat(order.total_price).toFixed(2)} $
                        </Text>
                        <TouchableOpacity
                          style={{ marginRight: 15 }}
                          onPress={() => setUpdatePriceMode(true)}
                        >
                          <Foundation
                            name="pencil"
                            size={28}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,

                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Sous-totale:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.sub_total.toFixed(2)} $
                    </Text>
                  </View>
                  {order.discount > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 10,

                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.LATO_BOLD,
                          fontSize: 20,
                        }}
                      >
                        Sous-totale apres remise:
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.LATO_REGULAR,
                          fontSize: 20,
                          marginLeft: 10,
                        }}
                      >
                        {order.sub_total_after_discount?.toFixed(2)} $ (-{" "}
                        {order.discount} %)
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,

                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      TVQ:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {tvq.toFixed(2)} $
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,

                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      TPS:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {tps.toFixed(2)} $
                    </Text>
                  </View>

                  {order.type === "delivery" && (
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 10,

                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.LATO_BOLD,
                          fontSize: 20,
                        }}
                      >
                        Frais de livraison:
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.LATO_REGULAR,
                          fontSize: 20,
                          marginLeft: 10,
                        }}
                      >
                        {order.delivery_fee.toFixed(2)} $
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,

                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Pourboire:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.tip?.toFixed(2)} $
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginTop: 20,
              }}
            >
              Informations Client
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 / 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Nom & prénom:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.user?.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Téléphone:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order?.user?.phone_number}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 / 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      E-mail:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {order.user?.email}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 20,
                      }}
                    >
                      Adresse:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_REGULAR,
                        fontSize: 20,
                        marginLeft: 10,
                        width: "70%",
                        flexWrap: "wrap",
                      }}
                      numberOfLines={2}
                    >
                      {order.address}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View>
            <Text
              style={{
                fontFamily: Fonts.LATO_BOLD,
                fontSize: 24,
                marginTop: 20,
              }}
            >
              Review
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              {order.review.status ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",

                    width: "100%",
                    paddingHorizontal: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1 / 3,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 24,
                        marginRight: 12,
                      }}
                    >
                      Note:
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 24,
                        marginRight: 12,
                      }}
                    >
                      {order.review.rating}
                    </Text>
                    <Entypo name="star" size={32} color="gold" />
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: Fonts.LATO_BOLD,
                        fontSize: 24,
                        marginRight: 12,
                      }}
                    >
                      Commentaire:
                    </Text>
                    <Text
                      style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 24 }}
                    >
                      {order.review.comment}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 20 }}>
                  Aucune review
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderScreen;

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
    width: "70%",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: "cover",
  },
  infoContainer: {},
  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontFamily: Fonts.LATO_REGULAR, fontSize: 20 },
  infoContent: { fontFamily: Fonts.LATO_REGULAR, fontSize: 16, marginLeft: 20 },

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
  dropdown: {
    height: 30,

    borderColor: "black",
    borderWidth: 0.5,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flex: 1,
    marginHorizontal: 10,
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
    fontSize: 18,
    fontFamily: Fonts.LATO_REGULAR,
  },
  selectedTextStyle: {
    fontSize: 18,
    fontFamily: Fonts.LATO_REGULAR,
  },
});
