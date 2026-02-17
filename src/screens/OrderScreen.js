import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  cancelUberDirectDelivery,
  createUberDirectDelivery,
  updateDeliveryProvider,
  updatePaymentStatus,
  updatePrice,
  updateStatus,
} from "../services/OrdersServices";
import SuccessModel from "../components/models/SuccessModel";
import FailModel from "../components/models/FailModel";
import ErrorScreen from "../components/ErrorScreen";
import { useSelector } from "react-redux";
import { selectStaffData, selectStaffToken } from "../redux/slices/StaffSlice";
import BackButton from "../components/BackButton";

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
  const staff = useSelector(selectStaffData);
  const token = useSelector(selectStaffToken);

  const [updatePriceMode, setUpdatePriceMode] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");

  const [driversList, setDriversList] = useState([]);
  const [driver, setDriver] = useState({});
  const [updateDriverMode, setUpdateDriverMode] = useState(false);
  const [payment_status, setPaymentStatus] = useState(null);
  const [isCreatingUberDelivery, setIsCreatingUberDelivery] = useState(false);
  const [isUpdatingDeliveryProvider, setIsUpdatingDeliveryProvider] =
    useState(false);
  const [isCancelingUberDelivery, setIsCancelingUberDelivery] = useState(false);
  const [isEditingDeliveryProvider, setIsEditingDeliveryProvider] =
    useState(false);
  const [selectedDeliveryProvider, setSelectedDeliveryProvider] = useState("");

  const restaurantId =
    (typeof staff?.restaurant === "object"
      ? staff?.restaurant?._id
      : staff?.restaurant) ||
    order?.restaurant?._id ||
    order?.restaurant;
  const hasUberDelivery = Boolean(order?.uber_delivery_id);
  const isDeliveryOrder = ["delivery", "devliery"].includes(
    String(order?.type || "").toLowerCase(),
  );
  const isUberProvider = order?.delivery_provider === "uber_direct";
  const normalizedUberStatus = String(order?.uber_status || "")
    .toLowerCase()
    .trim();
  const isUberRetryableStatus = [
    "canceled",
    "cancelled",
    "returned",
    "failed",
  ].includes(normalizedUberStatus);
  const isUberCompletedStatus = normalizedUberStatus === "delivered";
  const hasActiveUberDelivery =
    isUberProvider &&
    hasUberDelivery &&
    !isUberRetryableStatus &&
    !isUberCompletedStatus;
  const promoCode = order?.promoCode;
  const hasPromoCode = Boolean(promoCode?.code);
  const hasPromoAmount =
    promoCode?.amount !== null && promoCode?.amount !== undefined;
  const hasPromoPercent =
    promoCode?.percent !== null && promoCode?.percent !== undefined;
  const hasFreeItemPromo =
    promoCode?.type === "free_item" && Boolean(promoCode?.freeItem?.name);
  const formattedPromoAmount = hasPromoAmount
    ? Number.isNaN(Number(promoCode.amount))
      ? `${promoCode.amount} $`
      : `${Number(promoCode.amount).toFixed(2)} $`
    : null;

  const baseStatusOptions = [
    { label: OrderStatus.ON_GOING, value: OrderStatus.ON_GOING },
    { label: OrderStatus.PROGRAMMED, value: OrderStatus.PROGRAMMED },
    { label: OrderStatus.READY, value: OrderStatus.READY },
    { label: OrderStatus.DONE, value: OrderStatus.DONE },
    { label: OrderStatus.IN_DELIVERY, value: OrderStatus.IN_DELIVERY },

    { label: OrderStatus.CANCELED, value: OrderStatus.CANCELED },
  ];
  const statusOptions =
    order?.status &&
    !baseStatusOptions.some((option) => option.value === order.status)
      ? [{ label: order.status, value: order.status }, ...baseStatusOptions]
      : baseStatusOptions;
  const deliveryProviderOptions = [
    { label: "Livraison Uber", value: "uber_direct" },
    { label: "Livraison interne", value: "staff" },
  ];
  const uberStatusTranslations = {
    pending: "en cours",
    pickup: "ramassage en cours",
    pickup_complete: "ramassage terminé",
    dropoff: "livraison en cours",
    delivered: "livrée",
    canceled: "annulée par Uber",
    cancelled: "annulée par Uber",
    return: "retour en cours",
    returned: "retournée",
    failed: "échouée chez Uber",
    unassigned: "en attente d'un livreur",
    courier_assigned: "livreur assigné",
    courier_at_pickup: "livreur arrivé au point de ramassage",
    courier_picked_up: "commande récupérée",
    courier_at_dropoff: "livreur arrivé au point de livraison",
  };

  const isRetryableUberStatusValue = (uberStatus) =>
    ["canceled", "cancelled", "returned", "failed"].includes(
      String(uberStatus || "")
        .toLowerCase()
        .trim(),
    );

  const formatDeliveryProviderLabel = (provider) => {
    if (provider === "uber_direct") return "Uber Direct";
    if (provider === "staff") return "Interne";
    return provider;
  };

  const translateUberStatus = (uberStatus, courierImminent) => {
    const normalizedStatus = String(uberStatus || "")
      .toLowerCase()
      .trim();
    const imminent = Boolean(courierImminent);

    if (normalizedStatus === "pending") {
      return "en attente de livreur";
    }
    if (normalizedStatus === "pickup") {
      return imminent
        ? "livreur arrive au restaurant (environ 1 min)"
        : "livreur en route vers le restaurant";
    }
    if (normalizedStatus === "dropoff") {
      return imminent
        ? "livreur arrive chez le client (environ 1 min)"
        : "livraison en route vers le client";
    }

    return uberStatusTranslations[normalizedStatus] || uberStatus;
  };

  const formatDateWithoutSeconds = (dateInString) => {
    const date = new Date(dateInString);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    const nextStatus = status || order?.status;
    if (!nextStatus) {
      return;
    }

    setIsLoading(true);
    updateStatus(order._id, nextStatus, token)
      .then((response) => {
        if (response.status) {
          setShowSuccessModel(true);
          setOrder({ ...order, status: nextStatus });
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

  useEffect(() => {
    setSelectedDeliveryProvider(order?.delivery_provider || "");
    setIsEditingDeliveryProvider(!order?.delivery_provider);
  }, [order?.delivery_provider]);

  useEffect(() => {
    setStatus(order?.status || "");
  }, [order?.status]);

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

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1);
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

  const handleApplyDeliveryProvider = async () => {
    if (!order?._id || !isDeliveryOrder) {
      return;
    }

    if (!token) {
      Alert.alert(
        "Session expirée",
        "Reconnectez-vous pour modifier le mode de livraison.",
      );
      return;
    }

    if (!["staff", "uber_direct"].includes(selectedDeliveryProvider)) {
      Alert.alert(
        "Choix invalide",
        "Sélectionnez un mode de livraison valide.",
      );
      return;
    }

    if (selectedDeliveryProvider === "uber_direct" && !restaurantId) {
      Alert.alert(
        "Restaurant introuvable",
        "Impossible de créer la livraison Uber sans restaurant.",
      );
      return;
    }

    setIsUpdatingDeliveryProvider(true);
    try {
      const previousProvider = order?.delivery_provider || null;
      const providerResponse = await updateDeliveryProvider(
        order._id,
        selectedDeliveryProvider,
        token,
      );

      if (!providerResponse.status) {
        Alert.alert(
          "Mise à jour impossible",
          providerResponse.message || "Une erreur est survenue.",
        );
        return;
      }

      if (selectedDeliveryProvider === "staff") {
        setOrder((prev) => ({
          ...prev,
          delivery_provider: "staff",
        }));
        setSelectedDeliveryProvider("staff");
        setIsEditingDeliveryProvider(false);
        setShowSuccessModel(true);
        setRefresh((prev) => prev + 1);
        return;
      }

      const shouldCreateUberDelivery =
        !hasUberDelivery ||
        previousProvider !== "uber_direct" ||
        isRetryableUberStatusValue(order?.uber_status);

      if (!shouldCreateUberDelivery) {
        setOrder((prev) => ({
          ...prev,
          delivery_provider: "uber_direct",
        }));
        setSelectedDeliveryProvider("uber_direct");
        setIsEditingDeliveryProvider(false);
        setShowSuccessModel(true);
        setRefresh((prev) => prev + 1);
        return;
      }

      setIsCreatingUberDelivery(true);
      const deliveryResponse = await createUberDirectDelivery(
        restaurantId,
        order._id,
        token,
      );

      if (!deliveryResponse.status) {
        if (previousProvider !== "uber_direct") {
          await updateDeliveryProvider(order._id, previousProvider, token);
        }
        setOrder((prev) => ({
          ...prev,
          delivery_provider: previousProvider,
        }));
        setSelectedDeliveryProvider(previousProvider || "");
        setIsEditingDeliveryProvider(!previousProvider);
        Alert.alert(
          "Création Uber Direct échouée",
          deliveryResponse.message || "Une erreur est survenue.",
        );
        return;
      }

      const uberDelivery = deliveryResponse.data || {};
      setOrder((prev) => ({
        ...prev,
        delivery_provider: "uber_direct",
        uber_delivery_id:
          uberDelivery?.id ||
          uberDelivery?.delivery_id ||
          prev?.uber_delivery_id,
        uber_status: uberDelivery?.status || prev?.uber_status,
        uber_courier_imminent:
          uberDelivery?.courier_imminent ?? prev?.uber_courier_imminent,
        uber_tracking_url:
          uberDelivery?.tracking_url || prev?.uber_tracking_url,
        uber_pickup_eta: uberDelivery?.pickup_eta || prev?.uber_pickup_eta,
        uber_dropoff_eta: uberDelivery?.dropoff_eta || prev?.uber_dropoff_eta,
      }));
      setSelectedDeliveryProvider("uber_direct");
      setIsEditingDeliveryProvider(false);
      setShowSuccessModel(true);
      setRefresh((prev) => prev + 1);
    } catch (err) {
      Alert.alert(
        "Mise à jour impossible",
        err?.message || "Une erreur est survenue.",
      );
    } finally {
      setIsUpdatingDeliveryProvider(false);
      setIsCreatingUberDelivery(false);
    }
  };

  const handleCancelUberDelivery = () => {
    if (!order?._id || !order?.uber_delivery_id) {
      Alert.alert(
        "Livraison introuvable",
        "Aucune livraison Uber active à annuler.",
      );
      return;
    }

    if (!restaurantId) {
      Alert.alert(
        "Restaurant introuvable",
        "Impossible d'annuler la livraison Uber sans restaurant.",
      );
      return;
    }

    if (!token) {
      Alert.alert(
        "Session expirée",
        "Reconnectez-vous pour annuler la livraison Uber.",
      );
      return;
    }

    Alert.alert(
      "Annuler la livraison Uber",
      "Voulez-vous vraiment annuler cette livraison Uber Direct ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              setIsCancelingUberDelivery(true);
              const response = await cancelUberDirectDelivery(
                restaurantId,
                order.uber_delivery_id,
                token,
              );

              if (!response.status) {
                Alert.alert(
                  "Annulation impossible",
                  response.message || "Une erreur est survenue.",
                );
                return;
              }

              const canceledDelivery = response.data || {};
              setOrder((prev) => ({
                ...prev,
                delivery_provider: null,
                uber_delivery_id: null,
                uber_status: canceledDelivery?.status || "canceled",
                uber_courier_imminent: null,
                uber_tracking_url: null,
                uber_pickup_eta: null,
                uber_dropoff_eta: null,
              }));
              setSelectedDeliveryProvider("");
              setIsEditingDeliveryProvider(true);
              setShowSuccessModel(true);
              setRefresh((prev) => prev + 1);
            } catch (err) {
              Alert.alert(
                "Annulation impossible",
                err?.message || "Une erreur est survenue.",
              );
            } finally {
              setIsCancelingUberDelivery(false);
            }
          },
        },
      ],
    );
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
    <View style={styles.screen}>
      {showSuccessModel && <SuccessModel />}
      {showFailModal && (
        <FailModel message="Oops ! Quelque chose s'est mal passé" />
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <BackButton />
        <View style={styles.topCard}>
          <View style={styles.topRow}>
            <Text style={styles.pageTitle}>Commande #{order.code || "—"}</Text>
            <View style={styles.topInlineMetaRow}>
              <Text
                style={[styles.topInlineMetaText, styles.topInlineMetaTextType]}
              >
                Type: {isDeliveryOrder ? "Livraison" : "Emporter"}
              </Text>
              <Text style={styles.topInlineMetaText}>
                Créé le {formatDateWithoutSeconds(order.createdAt)}
              </Text>
              <Text style={styles.topInlineMetaText}>
                Prix: {parseFloat(order.total_price).toFixed(2)} $
              </Text>
            </View>
          </View>
          {isDeliveryOrder && (
            <View style={styles.deliveryAddressRow}>
              <Text style={styles.metaItem}>
                Adresse de livraison : {order.address}
              </Text>
            </View>
          )}
          <View style={styles.orderStatusCard}>
            <Text style={styles.deliveryProviderTitle}>
              Etat de la commande :
            </Text>
            <View style={styles.deliveryProviderPickerRow}>
              <View style={styles.deliveryProviderDropdownWrapper}>
                <Dropdown
                  style={[styles.dropdown, styles.statusDropdown]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedStyle={styles.selectedStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  containerStyle={styles.containerStyle}
                  data={statusOptions}
                  maxHeight={220}
                  labelField="label"
                  valueField="value"
                  placeholder="Choisir l'état"
                  value={status || null}
                  onChange={(item) => setStatus(item.value)}
                />
              </View>
              <TouchableOpacity
                style={styles.uberButton}
                activeOpacity={0.9}
                onPress={updateOrderStatus}
              >
                <Ionicons name="checkmark-circle" size={16} color="#1b1b1b" />
                <Text style={styles.uberButtonLabel}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
          {order.scheduled?.isScheduled && order.scheduled?.scheduledFor ? (
            <View style={styles.topSecondaryMetaRow}>
              <Text style={styles.topSecondaryMetaText}>
                Programmé le{" "}
                {formatDateWithoutSeconds(order.scheduled.scheduledFor)}
              </Text>
            </View>
          ) : null}
          {isDeliveryOrder && (
            <View style={styles.deliveryProviderCard}>
              <Text style={styles.deliveryProviderTitle}>
                Mode de livraison
              </Text>
              <View style={styles.uberActionsRow}>
                {order.delivery_provider ? (
                  <View style={styles.uberStatusPill}>
                    <Text style={styles.uberStatusLabel}>
                      Livraison par:{" "}
                      {formatDeliveryProviderLabel(order.delivery_provider)}
                    </Text>
                  </View>
                ) : null}
                {hasActiveUberDelivery ? (
                  <TouchableOpacity
                    style={[
                      styles.uberButton,
                      styles.cancelButton,
                      isCancelingUberDelivery && styles.uberButtonDisabled,
                    ]}
                    disabled={isCancelingUberDelivery}
                    activeOpacity={0.9}
                    onPress={handleCancelUberDelivery}
                  >
                    {isCancelingUberDelivery ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.cancelButtonLabel}>Annuler</Text>
                  </TouchableOpacity>
                ) : null}
                {(order.delivery_provider === "staff" ||
                  (order.delivery_provider === "uber_direct" &&
                    (isUberRetryableStatus || !hasUberDelivery))) &&
                !isEditingDeliveryProvider ? (
                  <TouchableOpacity
                    style={[styles.uberButton, styles.modifyButton]}
                    activeOpacity={0.9}
                    onPress={() => setIsEditingDeliveryProvider(true)}
                  >
                    <Ionicons name="pencil" size={16} color="#1D4ED8" />
                    <Text style={styles.modifyButtonLabel}>Modifier</Text>
                  </TouchableOpacity>
                ) : null}
                {isUberProvider && order.uber_status ? (
                  <View style={styles.uberStatusPill}>
                    <Text style={styles.uberStatusLabel}>
                      Livraison Uber :{" "}
                      {translateUberStatus(
                        order.uber_status,
                        order.uber_courier_imminent,
                      )}
                    </Text>
                  </View>
                ) : null}
                {isUberProvider && order.uber_pickup_eta ? (
                  <View style={styles.uberEtaPill}>
                    <Text style={styles.uberEtaLabel}>
                      Pickup estimé:{" "}
                      {formatDateWithoutSeconds(order.uber_pickup_eta)}
                    </Text>
                  </View>
                ) : null}
              </View>
              {(!order.delivery_provider || isEditingDeliveryProvider) && (
                <View style={styles.deliveryProviderPickerRow}>
                  <View style={styles.deliveryProviderDropdownWrapper}>
                    <Dropdown
                      style={[styles.dropdown, styles.deliveryProviderDropdown]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      selectedStyle={styles.selectedStyle}
                      itemContainerStyle={styles.itemContainerStyle}
                      itemTextStyle={styles.itemTextStyle}
                      containerStyle={styles.containerStyle}
                      data={deliveryProviderOptions}
                      maxHeight={220}
                      labelField="label"
                      valueField="value"
                      placeholder="Choisir le mode"
                      value={selectedDeliveryProvider || null}
                      onChange={(item) =>
                        setSelectedDeliveryProvider(item.value)
                      }
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.uberButton,
                      (isUpdatingDeliveryProvider || isCreatingUberDelivery) &&
                        styles.uberButtonDisabled,
                    ]}
                    disabled={
                      isUpdatingDeliveryProvider ||
                      isCreatingUberDelivery ||
                      !selectedDeliveryProvider
                    }
                    activeOpacity={0.9}
                    onPress={handleApplyDeliveryProvider}
                  >
                    {isUpdatingDeliveryProvider || isCreatingUberDelivery ? (
                      <ActivityIndicator size="small" color="#1b1b1b" />
                    ) : (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#1b1b1b"
                      />
                    )}
                    <Text style={styles.uberButtonLabel}>Valider</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsText}>
              {order.instructions ? order.instructions : "Aucune"}
            </Text>
          </View>
        </View>

        {hasFreeItemPromo && (
          <View style={styles.promoFreeItemBanner}>
            <Text style={styles.promoFreeItemBannerText}>
              Code promo article gratuit: {promoCode.freeItem.name}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Panier</Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Articles</Text>
            {order.orderItems?.length > 0 ? (
              <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderCell, { flex: 0.5 }]}>
                    Article
                  </Text>
                  <Text style={[styles.listHeaderCell, { flex: 1 }]}>
                    Commentaire
                  </Text>
                  <Text style={[styles.listHeaderCell, { width: 80 }]}>
                    Taille
                  </Text>
                  <Text style={[styles.listHeaderCell, { flex: 1 }]}>
                    Options
                  </Text>
                  <Text style={[styles.listHeaderCell, { width: 80 }]}>
                    Prix
                  </Text>
                </View>
                {order.orderItems?.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.listRow,
                      index % 2 === 0 && styles.listRowAlt,
                    ]}
                  >
                    <Text
                      style={[styles.listCell, { flex: 0.5 }]}
                      numberOfLines={2}
                    >
                      {item.item.name}
                    </Text>
                    <Text
                      style={[styles.listCell, { flex: 1 }]}
                      numberOfLines={2}
                    >
                      {item.comment || "—"}
                    </Text>
                    <Text style={[styles.listCell, { width: 80 }]}>
                      {item.size}
                    </Text>
                    <Text style={[styles.listCell, { flex: 1 }]}>
                      {item.customizations
                        ?.map((custo) => custo.name)
                        .join(", ")}
                    </Text>
                    <Text style={[styles.listCell, { width: 80 }]}>
                      {parseFloat(item.price).toFixed(2)} $
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun article</Text>
              </View>
            )}
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Offres</Text>
            {order.offers?.length > 0 ? (
              <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderCell, { flex: 1.5 }]}>
                    Offre
                  </Text>
                  <Text style={[styles.listHeaderCell, { flex: 2 }]}>
                    Articles
                  </Text>
                  <Text style={[styles.listHeaderCell, { flex: 1 }]}>Prix</Text>
                </View>
                {order.offers?.map((item, index) => (
                  <View
                    key={item._id}
                    style={[
                      styles.listRow,
                      index % 2 === 0 && styles.listRowAlt,
                    ]}
                  >
                    <Text
                      style={[styles.listCell, { flex: 1.5 }]}
                      numberOfLines={1}
                    >
                      {item.offer?.name}
                    </Text>
                    <View style={[styles.listCell, { flex: 2 }]}>
                      {item.items?.map((offerItem, i) => (
                        <Text key={i} style={styles.subText}>
                          <Text style={styles.offerItemName}>
                            {offerItem.item.name}
                          </Text>
                          {offerItem.customizations?.length ? (
                            <Text style={styles.offerItemCustomizations}>
                              {" "}
                              (
                              {offerItem.customizations
                                ?.map((c) => c.name)
                                .join(", ")}
                              )
                            </Text>
                          ) : null}
                        </Text>
                      ))}
                    </View>
                    <Text style={[styles.listCell, { flex: 1 }]}>
                      {parseFloat(item.price).toFixed(2)} $
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucune offre</Text>
              </View>
            )}
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Récompenses</Text>
            {order.rewards?.length > 0 ? (
              <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderCell, { flex: 1 }]}>
                    Article
                  </Text>
                </View>
                {order.rewards?.map((item, index) => (
                  <View
                    key={index}
                    style={[styles.listRow, styles.listRowAlt1]}
                  >
                    <Text
                      style={[styles.listCell1, { flex: 1 }]}
                      numberOfLines={1}
                    >
                      {item.item.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucune récompense</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Informations générale</Text>
            </View>
          </View>
          <View style={styles.infoColumns}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Code</Text>
                <Text style={styles.infoValue}>{order.code}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {isDeliveryOrder ? "Livraison" : "Emporter"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Créé le</Text>
                <Text style={styles.infoValue}>
                  {convertDate(order.createdAt)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Articles</Text>
                <Text style={styles.infoValue}>
                  {order.orderItems?.length +
                    order.offers?.length +
                    order.rewards?.length}{" "}
                  article(s)
                </Text>
              </View>
              {hasPromoCode && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Code promo</Text>
                  <Text style={styles.infoValue}>{promoCode.code}</Text>
                </View>
              )}
              {hasPromoAmount && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rabais</Text>
                  <Text style={styles.infoValue}>{formattedPromoAmount}</Text>
                </View>
              )}
              {hasPromoPercent && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rabais</Text>
                  <Text style={styles.infoValue}>{promoCode.percent} %</Text>
                </View>
              )}
              {hasFreeItemPromo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Article gratuit</Text>
                  <Text style={styles.infoValue}>
                    {promoCode.freeItem?.name}
                  </Text>
                </View>
              )}

              {order.discount > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rabais première commande</Text>
                  <Text style={styles.infoValue}>{order.discount} %</Text>
                </View>
              )}
              {isUberProvider && order.uber_pickup_eta && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Arrivée livreur (pickup)</Text>
                  <Text style={styles.infoValue}>
                    {formatDateWithoutSeconds(order.uber_pickup_eta)}
                  </Text>
                </View>
              )}
              {isUberProvider && order.uber_dropoff_eta && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Livraison estimée</Text>
                  <Text style={styles.infoValue}>
                    {formatDateWithoutSeconds(order.uber_dropoff_eta)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total</Text>
                {updatePriceMode ? (
                  <View style={styles.valueWithIcon}>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="numeric"
                      placeholder={parseFloat(order.total_price).toFixed(2)}
                      onChangeText={(text) => setPrice(text)}
                    />
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={updateOrderPrice}
                    >
                      <Text style={styles.smallButtonLabel}>Enregistrer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.valueWithIcon}>
                    <Text style={styles.infoValue}>
                      {parseFloat(order.total_price).toFixed(2)} $
                    </Text>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.editButton]}
                      onPress={() => setUpdatePriceMode(true)}
                    >
                      <Ionicons name="pencil" size={20} color="#1D4ED8" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sous-total</Text>
                <Text style={styles.infoValue}>
                  {order.sub_total.toFixed(2)} $
                </Text>
              </View>

              {order.discount > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Après remise</Text>
                  <Text style={styles.infoValue}>
                    {order.sub_total_after_discount?.toFixed(2)} $ (-{" "}
                    {order.discount} %)
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TVQ</Text>
                <Text style={styles.infoValue}>{tvq.toFixed(2)} $</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TPS</Text>
                <Text style={styles.infoValue}>{tps.toFixed(2)} $</Text>
              </View>
              {isDeliveryOrder && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Frais de livraison</Text>
                  <Text style={styles.infoValue}>
                    {order.delivery_fee.toFixed(2)} $
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pourboire</Text>
                <Text style={styles.infoValue}>{order.tip?.toFixed(2)} $</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Informations Client</Text>
          </View>
          <View style={styles.infoColumns}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom & prénom</Text>
                <Text style={styles.infoValue}>{order.user?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>
                  {order?.user?.phone_number}
                </Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{order.user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={[styles.infoValue, { flex: 1 }]} numberOfLines={2}>
                  {order.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Critique</Text>
          </View>
          <View style={styles.reviewBox}>
            {order.review.status ? (
              <View style={styles.reviewRow}>
                <View style={styles.reviewScore}>
                  <Text style={styles.reviewLabel}>Note</Text>
                  <Text style={styles.reviewValue}>{order.review.rating}</Text>
                  <Entypo name="star" size={24} color="gold" />
                </View>
                <View style={styles.reviewComment}>
                  <Text style={styles.reviewLabel}>Commentaire</Text>
                  <Text style={styles.reviewText}>{order.review.comment}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Aucune critique</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  topCard: {
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  topInlineMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-start",
    minWidth: 180,
  },
  topInlineMetaText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  topInlineMetaTextType: {
    color: Colors.primary,
    borderColor: "rgba(247,166,0,0.35)",
    backgroundColor: "rgba(247,166,0,0.12)",
  },
  deliveryAddressRow: {
    marginTop: 10,
  },
  topSecondaryMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topSecondaryMetaText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  pageTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 34,
    color: "#1b1b1b",
  },
  orderStatusCard: {
    marginTop: 12,
    gap: 10,
  },
  deliveryProviderCard: {
    marginTop: 12,
    gap: 10,
  },
  deliveryProviderTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  deliveryProviderPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  deliveryProviderDropdownWrapper: {
    flex: 1,
    minWidth: 170,
    maxWidth: 300,
  },
  deliveryProviderDropdown: {
    flex: 1,
    minWidth: 170,
  },
  uberActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  uberButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uberButtonDisabled: {
    opacity: 0.65,
  },
  uberButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
  },
  cancelButton: {
    backgroundColor: "#DC2626",
    borderColor: "rgba(127,29,29,0.35)",
  },
  cancelButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#FFFFFF",
  },
  modifyButton: {
    backgroundColor: "white",
    borderColor: "rgba(29,78,216,0.25)",
  },
  modifyButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1D4ED8",
  },
  uberStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(29,78,216,0.25)",
    backgroundColor: "rgba(29,78,216,0.12)",
  },
  uberStatusLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1D4ED8",
  },
  uberEtaPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.25)",
    backgroundColor: "rgba(20,184,166,0.12)",
  },
  uberEtaLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#0F766E",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  metaItem: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexShrink: 1,
    maxWidth: "100%",
  },
  metaItemPrimary: {
    color: Colors.primary,
    borderColor: "rgba(247,166,0,0.35)",
    backgroundColor: "rgba(247,166,0,0.12)",
  },
  promoFreeItemBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  promoFreeItemBannerText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#1b1b1b",
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.gry,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 26,
    color: "#1b1b1b",
  },
  sectionSubtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
    marginTop: 2,
  },
  infoColumns: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  infoColumn: {
    flex: 1,
    gap: 10,
    minWidth: "48%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#1b1b1b",
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: Colors.tgry,
  },
  valueWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  infoDropdown: {
    flex: 1,
    minWidth: 160,
  },
  statusDropdown: {
    flexGrow: 1,
    minWidth: 160,
    maxWidth: 220,
  },
  dropdown: {
    height: 42,
    borderColor: "rgba(0,0,0,0.15)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 2,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "white",
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
    fontSize: 16,
    padding: 0,
    margin: 0,
    fontFamily: Fonts.LATO_REGULAR,
  },
  containerStyle: {
    paddingHorizontal: 0,
    margin: 0,
  },

  placeholderStyle: {
    fontSize: 14,
    fontFamily: Fonts.LATO_REGULAR,
    color: Colors.tgry,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  smallButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
  },
  priceInput: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 90,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "white",
    color: "#1b1b1b",
  },
  instructionsBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  instructionsText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: "#1b1b1b",
    textAlign: "left",
  },
  listContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.screenBg,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  listHeaderCell: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: Colors.tgry,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  listRowAlt: {
    backgroundColor: "rgba(247, 165, 0, 0.6)",
  },
  listRowAlt1: {
    backgroundColor: "#c6372f",
  },
  listCell: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "#1b1b1b",
  },
  listCell1: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 14,
    color: "white",
  },
  subText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "black",
  },
  offerItemName: {
    fontFamily: Fonts.LATO_BOLD,
    color: "#1b1b1b",
  },
  offerItemCustomizations: {
    fontFamily: Fonts.LATO_REGULAR,
    color: "#1b1b1b",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  emptyText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: Colors.tgry,
  },
  subSection: {
    gap: 10,
    marginTop: 10,
  },
  subSectionTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  reviewBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    alignItems: "flex-start",
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  reviewScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 16,
    color: "#1b1b1b",
  },
  reviewValue: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "#1b1b1b",
  },
  reviewComment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  reviewText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: Colors.tgry,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  editButton: {
    backgroundColor: "rgba(29,78,216,0.12)",
    borderColor: "rgba(29,78,216,0.25)",
  },
});
