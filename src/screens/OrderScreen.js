import {
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts, OrderStatus } from "../constants";
import { Entypo } from "@expo/vector-icons";
import useGetOrder from "../hooks/useGetOrder";
import { convertDate } from "../utils/dateHandlers";
import { useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DiscoveryFilterOption,
  Printer,
  PrinterConstants,
  PrintersDiscovery,
  usePrintersDiscovery,
} from "react-native-esc-pos-printer";
import {
  cancelUberDirectDelivery,
  createUberDirectDelivery,
  updateDeliveryProvider,
  updateOrderRestaurant,
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
import { getRestaurantList } from "../services/RestaurantServices";
import {
  formatOrderStatus,
  normalizeOrderStatusValue,
} from "../utils/orderStatus";

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundMoney = (value, fallback = 0) => {
  const normalized = toSafeNumber(value, fallback);
  return Math.round(normalized * 100) / 100;
};

const RECEIPT_SEPARATOR = "--------------------------------";
const DISCOVERY_SETTLE_DELAY_MS = 400;
const SAVED_PRINTER_KEY = "last_used_printer";

const toReceiptText = (value) =>
  String(value ?? "")
    .replace(/[’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const formatReceiptMoney = (value, options = {}) => {
  const { freeWhenZero = false } = options;
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    return "0.00 $";
  }

  if (freeWhenZero && normalizedValue <= 0) {
    return "Gratuit";
  }

  return `${normalizedValue.toFixed(2)} $`;
};

const normalizeReceiptSize = (size) => {
  if (!size) return "";
  if (typeof size === "string") {
    return size.trim();
  }
  if (typeof size === "object") {
    return String(size?.size || size?.name || size?.label || "").trim();
  }
  return String(size).trim();
};

const normalizeReceiptId = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object") {
    return String(value?._id || value?.id || "").trim();
  }
  return String(value).trim();
};

const resolveOfferItemReceiptSize = (offer, offerItem, offerItemIndex = -1) => {
  const directSize = normalizeReceiptSize(offerItem?.size || offerItem?.item?.size);
  if (directSize) {
    return directSize;
  }

  const templateItems = Array.isArray(offer?.offer?.items) ? offer.offer.items : [];
  const indexedTemplateItem =
    offerItemIndex >= 0 && offerItemIndex < templateItems.length
      ? templateItems[offerItemIndex]
      : null;
  const indexedSize = normalizeReceiptSize(
    indexedTemplateItem?.size || indexedTemplateItem?.item?.size,
  );

  if (indexedSize) {
    return indexedSize;
  }

  const offerItemId = normalizeReceiptId(offerItem?.item);
  const matchedTemplateItem = templateItems.find(
    (templateItem) => normalizeReceiptId(templateItem?.item) === offerItemId,
  );

  return normalizeReceiptSize(
    matchedTemplateItem?.size || matchedTemplateItem?.item?.size,
  );
};

const buildReceiptItemLabel = ({ name, size, quantity }) => {
  const normalizedName = String(name || "Article").trim() || "Article";
  const normalizedSize = normalizeReceiptSize(size);
  const quantityValue = Number(quantity);
  const sizeSuffix = normalizedSize ? ` (${normalizedSize})` : "";
  const quantitySuffix =
    Number.isFinite(quantityValue) && quantityValue > 1 ? ` x${quantityValue}` : "";

  return `${normalizedName}${sizeSuffix}${quantitySuffix}`;
};

const appendReceiptText = async (printerInstance, value, options = {}) => {
  const { large = false, bold = false } = options;
  const text = toReceiptText(value);
  if (!text) {
    return;
  }

  if (large || bold) {
    await printerInstance.addTextStyle({
      em: large || bold ? PrinterConstants.TRUE : PrinterConstants.FALSE,
    });
    await printerInstance.addTextSize({
      width: 1,
      height: large ? 2 : 1,
    });
  }

  await printerInstance.addText(`${text}\n`);

  if (large || bold) {
    await printerInstance.addTextStyle({ em: PrinterConstants.FALSE });
    await printerInstance.addTextSize({ width: 1, height: 1 });
  }
};

const appendReceiptLine = async (printerInstance, left, right, options = {}) => {
  const { large = false, bold = false } = options;

  if (large || bold) {
    await printerInstance.addTextStyle({
      em: large || bold ? PrinterConstants.TRUE : PrinterConstants.FALSE,
    });
    await printerInstance.addTextSize({
      width: 1,
      height: large ? 2 : 1,
    });
  }

  await Printer.addTextLine(printerInstance, {
    left: toReceiptText(left),
    right: toReceiptText(right),
    textToWrap: "left",
  });
  await printerInstance.addText("\n");

  if (large || bold) {
    await printerInstance.addTextStyle({ em: PrinterConstants.FALSE });
    await printerInstance.addTextSize({ width: 1, height: 1 });
  }
};

const appendReceiptDivider = async (printerInstance) => {
  await printerInstance.addText(`${RECEIPT_SEPARATOR}\n`);
};

const connectPrinterWithRetries = async (printerInstance, attempts = 4) => {
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await printerInstance.connect(1500);
      const status = await printerInstance.getStatus();

      if (status?.online?.statusCode === PrinterConstants.TRUE) {
        return;
      }

      lastError = new Error("Imprimante hors ligne.");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Connexion impossible.");
};

const disconnectPrinterSafely = async (printerInstance) => {
  if (!printerInstance) {
    return;
  }

  try {
    await printerInstance.disconnect();
  } catch (error) {}
};

const waitForDiscoverySettled = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, DISCOVERY_SETTLE_DELAY_MS);
  });
};

const ensureBluetoothPermissions = async () => {
  if (Platform.OS !== "android") {
    return true;
  }

  const apiLevel = Number(Platform.Version);

  try {
    const permissionsToRequest = [];

    if (apiLevel >= 31) {
      permissionsToRequest.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } else if (apiLevel >= 29) {
      permissionsToRequest.push(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } else {
      permissionsToRequest.push(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      );
    }

    const permissions = await PermissionsAndroid.requestMultiple(
      permissionsToRequest,
    );

    return permissionsToRequest.every(
      (permission) =>
        permissions?.[permission] === PermissionsAndroid.RESULTS.GRANTED,
    );
  } catch (error) {
    return false;
  }
};

const ensureAndroidLocationServices = async () => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (servicesEnabled) {
      return true;
    }

    await Location.enableNetworkProviderAsync();

    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    return false;
  }
};

const stopPrinterDiscoverySafely = async () => {
  try {
    await PrintersDiscovery.stop();
  } catch (error) {}

  await waitForDiscoverySettled();
};

const toPrinterWorkflowErrorMessage = (error, fallback) => {
  const details = [
    typeof error === "string" ? error : "",
    error?.message,
    error?.cause?.message,
    error?.status,
    error?.code,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);

  const combinedMessage = details.join(" | ");

  if (
    combinedMessage.includes("Tried to start search when search had been already done")
  ) {
    return "La recherche Bluetooth etait deja en cours. Le scan attend maintenant l'arret complet du precedent avant de relancer la detection.";
  }

  if (
    combinedMessage.includes("There is no permission for the position information")
  ) {
    return "Android refuse encore l'acces a la localisation. Autorisez la localisation pour l'application et activez la localisation de la tablette.";
  }

  if (combinedMessage.includes("Bluetooth is OFF")) {
    return "Le SDK Epson indique que le Bluetooth n'est pas disponible. Verifiez aussi que la localisation Android de la tablette est activee.";
  }

  if (details.length > 0) {
    return combinedMessage;
  }

  if (error && typeof error === "object") {
    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch (serializationError) {}
  }

  return fallback;
};

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
  const {
    printers,
    isDiscovering,
    printerError,
  } = usePrintersDiscovery();

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
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
  const [isUpdatingRestaurant, setIsUpdatingRestaurant] = useState(false);
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [isPreparingPrinterDiscovery, setIsPreparingPrinterDiscovery] =
    useState(false);
  const [selectedPrinterTarget, setSelectedPrinterTarget] = useState("");
  const [printerWorkflowError, setPrinterWorkflowError] = useState("");
  const [printerWorkflowStatus, setPrinterWorkflowStatus] = useState("");
  const printerDiscoveryLockRef = useRef(false);

  const restaurantId =
    (typeof staff?.restaurant === "object"
      ? staff?.restaurant?._id
      : staff?.restaurant) ||
    order?.restaurant?._id ||
    order?.restaurant;
  const orderRestaurantId =
    (typeof order?.restaurant === "object"
      ? order?.restaurant?._id
      : order?.restaurant) || "";
  const orderRestaurantName =
    typeof order?.restaurant === "object" ? order?.restaurant?.name : "";
  const hasUberDelivery = Boolean(order?.uber_delivery_id);
  const isDeliveryOrder = ["delivery", "devliery"].includes(
    String(order?.type || "").toLowerCase(),
  );
  const hasUberCreationFailure =
    isDeliveryOrder &&
    !hasUberDelivery &&
    Boolean(order?.uber_creation_failed || order?.uber_creation_error);
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
  const subscriptionBenefits =
    order?.subscriptionBenefits &&
    typeof order.subscriptionBenefits === "object"
      ? order.subscriptionBenefits
      : null;
  const subscriptionUsed = Boolean(subscriptionBenefits?.isApplied);
  const subscriptionDiscountPercent = Number.isFinite(
    Number(subscriptionBenefits?.discountPercent),
  )
    ? Number(subscriptionBenefits.discountPercent)
    : 0;
  const orderDiscountPercent = Number.isFinite(Number(order?.discount))
    ? Number(order.discount)
    : 0;
  const isFirstOrderDiscountApplied = orderDiscountPercent >= 20;
  const showSubscriptionDiscountInfo =
    subscriptionUsed &&
    !isFirstOrderDiscountApplied &&
    (subscriptionDiscountPercent > 0 || orderDiscountPercent > 0);
  const subscriptionFreeDeliveryApplied = Boolean(
    subscriptionBenefits?.freeDeliveryApplied,
  );
  const subscriptionDiscountPercentDisplay =
    subscriptionDiscountPercent > 0
      ? subscriptionDiscountPercent
      : orderDiscountPercent > 0
        ? orderDiscountPercent
        : 15;
  const deliveryFeeValue = Number.isFinite(Number(order?.delivery_fee))
    ? Number(order.delivery_fee)
    : 0;
  const normalizedPaymentMethod = String(order?.payment_method || "")
    .trim()
    .toLowerCase();
  const isCounterPayment = normalizedPaymentMethod === "cash_at_counter";
  const paymentMethodLabel = isCounterPayment
    ? "Paiement au comptoir"
    : normalizedPaymentMethod === "subscription_free_item"
      ? "Article gratuit"
      : "Paiement en ligne";
  const displayedDeliveryFee =
    subscriptionUsed && subscriptionFreeDeliveryApplied ? 0 : deliveryFeeValue;
  const normalizedSubtotal = toSafeNumber(order?.sub_total, 0);
  const normalizedSubtotalAfterDiscount = Number.isFinite(
    Number(order?.sub_total_after_discount),
  )
    ? Number(order.sub_total_after_discount)
    : normalizedSubtotal;
  const normalizedTip = toSafeNumber(order?.tip, 0);
  const normalizedTotalPrice = toSafeNumber(order?.total_price, 0);
  const customerPhone = String(order?.user?.phone_number || "").trim();
  const shouldShowDiscountedSubtotal =
    orderDiscountPercent > 0 ||
    hasPromoAmount ||
    hasPromoPercent ||
    Math.abs(normalizedSubtotalAfterDiscount - normalizedSubtotal) > 0.01;
  const totalReceiptDiscountAmount = roundMoney(
    Math.max(0, normalizedSubtotal - normalizedSubtotalAfterDiscount),
    0,
  );
  const subscriptionDiscountAmount = roundMoney(
    subscriptionBenefits?.discountAmount,
    showSubscriptionDiscountInfo
      ? normalizedSubtotal * (subscriptionDiscountPercentDisplay / 100)
      : 0,
  );
  const firstOrderDiscountAmount = isFirstOrderDiscountApplied
    ? roundMoney(normalizedSubtotal * (orderDiscountPercent / 100), 0)
    : 0;
  const promoDiscountAmount = hasPromoCode
    ? roundMoney(
        Math.max(
          0,
          totalReceiptDiscountAmount -
            subscriptionDiscountAmount -
            firstOrderDiscountAmount,
        ),
        0,
      )
    : 0;
  const genericPromotionAmount =
    !hasPromoCode &&
    !isFirstOrderDiscountApplied &&
    !showSubscriptionDiscountInfo &&
    totalReceiptDiscountAmount > 0.01
      ? totalReceiptDiscountAmount
      : 0;
  const referralDiscountAmount = roundMoney(order?.referralDiscountApplied, 0);
  const promoLineLabel = hasPromoCode
    ? hasPromoPercent
      ? `Code promo ${promoCode.code} (-${promoCode.percent}%)`
      : hasPromoAmount
        ? `Code promo ${promoCode.code} (-${formattedPromoAmount})`
        : hasFreeItemPromo
          ? `Code promo ${promoCode.code} (${promoCode.freeItem?.name})`
          : `Code promo ${promoCode.code}`
    : "";
  const promoLineValue = hasFreeItemPromo
    ? promoDiscountAmount > 0
      ? `-${formatReceiptMoney(promoDiscountAmount)}`
      : "Offert"
    : promoDiscountAmount > 0
      ? `-${formatReceiptMoney(promoDiscountAmount)}`
      : "";
  const subscriptionFreeItemApplied = Boolean(
    subscriptionBenefits?.freeItemApplied,
  );
  const subscriptionFreeItemAmount = Number.isFinite(
    Number(subscriptionBenefits?.freeItemAmount),
  )
    ? Number(subscriptionBenefits.freeItemAmount)
    : 0;
  const subscriptionFreeItemId = String(
    subscriptionBenefits?.freeItemMenuItemId?._id ||
      subscriptionBenefits?.freeItemMenuItemId ||
      "",
  ).trim();
  const subscriptionFreeItemLabel = String(
    subscriptionBenefits?.freeItemLabel || "",
  )
    .trim()
    .toLowerCase();
  const birthdayBenefits =
    order?.birthdayBenefits && typeof order.birthdayBenefits === "object"
      ? order.birthdayBenefits
      : null;
  const birthdayFreeItemApplied = Boolean(birthdayBenefits?.freeItemApplied);
  const birthdayFreeItemAmount = Number.isFinite(
    Number(birthdayBenefits?.freeItemAmount),
  )
    ? Number(birthdayBenefits.freeItemAmount)
    : 0;
  const birthdayFreeItemId = String(
    birthdayBenefits?.freeItemMenuItemId?._id ||
      birthdayBenefits?.freeItemMenuItemId ||
      "",
  ).trim();
  const birthdayFreeItemLabel = String(birthdayBenefits?.freeItemLabel || "")
    .trim()
    .toLowerCase();

  const baseStatusOptions = [
    { label: OrderStatus.ON_GOING, value: OrderStatus.ON_GOING },
    { label: OrderStatus.PROGRAMMED, value: OrderStatus.PROGRAMMED },
    { label: OrderStatus.READY, value: OrderStatus.READY },
    { label: OrderStatus.IN_DELIVERY, value: OrderStatus.IN_DELIVERY },
    {
      label: formatOrderStatus(OrderStatus.DELIVERED),
      value: OrderStatus.DELIVERED,
    },
    { label: OrderStatus.DONE, value: OrderStatus.DONE },
    { label: OrderStatus.CANCELED, value: OrderStatus.CANCELED },
  ];
  const currentStatusValue = normalizeOrderStatusValue(order?.status);
  const statusOptions =
    order?.status &&
    !baseStatusOptions.some(
      (option) => normalizeOrderStatusValue(option.value) === currentStatusValue,
    )
      ? [
          {
            label: formatOrderStatus(order.status),
            value: currentStatusValue,
          },
          ...baseStatusOptions,
        ]
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

  const formatTransactionDate = (dateInString) => {
    const date = new Date(dateInString);
    if (Number.isNaN(date.getTime())) return "—";

    const day = date.getDate();
    const month = date.toLocaleString("fr-FR", { month: "long" });
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${hours}:${minutes}`;
  };

  const loadRestaurantOptions = async () => {
    try {
      const response = await getRestaurantList();
      if (!response?.status || !Array.isArray(response?.data)) {
        return false;
      }

      const options = response.data
        .map((restaurant) => ({
          label: restaurant?.name || "Succursale",
          value: String(restaurant?._id || ""),
        }))
        .filter((option) => option.value);

      setRestaurantOptions(options);
      return options.length > 0;
    } catch (error) {
      return false;
    }
  };

  const openRestaurantEditor = async () => {
    if (!restaurantOptions.length) {
      const hasRestaurants = await loadRestaurantOptions();
      if (!hasRestaurants) {
        Alert.alert(
          "Succursales introuvables",
          "Impossible de charger la liste des succursales.",
        );
        return;
      }
    }

    setIsEditingRestaurant(true);
  };

  const selectedRestaurantName =
    restaurantOptions.find((option) => option.value === selectedRestaurantId)
      ?.label || "";
  const displayedRestaurantName =
    orderRestaurantName ||
    restaurantOptions.find(
      (option) => option.value === String(orderRestaurantId),
    )?.label ||
    "Non assignée";
  const discoveredPrinters = printers.filter((printer) => printer?.target);
  const printerErrorMessage = printerError
    ? toPrinterWorkflowErrorMessage(printerError, "")
    : "";
  const printerVisibleErrorMessage = [
    printerWorkflowError,
    printerErrorMessage && printerErrorMessage !== printerWorkflowError
      ? printerErrorMessage
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  useEffect(() => {
    if (showFailModal) {
      const timer = setTimeout(() => {
        setShowFailModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModal]);

  const updateOrderStatus = async () => {
    const nextStatus = normalizeOrderStatusValue(status || order?.status);
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
    setStatus(normalizeOrderStatusValue(order?.status || ""));
  }, [order?.status]);

  useEffect(() => {
    loadRestaurantOptions();
  }, []);

  useEffect(() => {
    if (orderRestaurantId) {
      setSelectedRestaurantId(String(orderRestaurantId));
    }
  }, [orderRestaurantId]);

  useEffect(() => {
    return () => {
      void stopPrinterDiscoverySafely();
    };
  }, []);

  const closePrinterModal = () => {
    setShowPrinterModal(false);
    setIsPreparingPrinterDiscovery(false);
    setSelectedPrinterTarget("");
    setPrinterWorkflowError("");
    setPrinterWorkflowStatus("");
    printerDiscoveryLockRef.current = false;
    void stopPrinterDiscoverySafely();
  };

  const scanBluetoothPrinters = async () => {
    if (
      printerDiscoveryLockRef.current ||
      isPreparingPrinterDiscovery ||
      isDiscovering ||
      isPrintingReceipt
    ) {
      return;
    }

    printerDiscoveryLockRef.current = true;
    setIsPreparingPrinterDiscovery(true);
    setPrinterWorkflowError("");
    setPrinterWorkflowStatus("Vérification des permissions Bluetooth...");

    try {
      const hasPermissions = await ensureBluetoothPermissions();
      if (!hasPermissions) {
        setPrinterWorkflowStatus("Recherche interrompue.");
        setPrinterWorkflowError(
          "Android exige les autorisations Bluetooth et localisation pour rechercher une imprimante.",
        );
        return;
      }

      setPrinterWorkflowStatus("Vérification de la localisation Android...");
      const hasLocationServices = await ensureAndroidLocationServices();
      if (!hasLocationServices) {
        setPrinterWorkflowStatus("Recherche interrompue.");
        setPrinterWorkflowError(
          "La localisation de la tablette doit etre activee pour que le scan Bluetooth Epson fonctionne.",
        );
        return;
      }

      setPrinterWorkflowStatus("Réinitialisation de la recherche Bluetooth...");
      await stopPrinterDiscoverySafely();

      setPrinterWorkflowStatus("Recherche Bluetooth en cours...");
      await PrintersDiscovery.start({
        timeout: 10000,
        filterOption: {
          deviceModel: DiscoveryFilterOption.MODEL_ALL,
          portType:
            Platform.OS === "ios"
              ? DiscoveryFilterOption.PORTTYPE_BLUETOOTH_LE
              : DiscoveryFilterOption.PORTTYPE_BLUETOOTH,
          ...(Platform.OS === "android"
            ? { bondedDevices: DiscoveryFilterOption.TRUE }
            : {}),
        },
      });
    } catch (error) {
      setPrinterWorkflowStatus("Recherche impossible.");
      setPrinterWorkflowError(
        toPrinterWorkflowErrorMessage(
          error,
          "Impossible de rechercher les imprimantes.",
        ),
      );
    } finally {
      setIsPreparingPrinterDiscovery(false);
      setTimeout(() => {
        printerDiscoveryLockRef.current = false;
      }, DISCOVERY_SETTLE_DELAY_MS);
    }
  };

  const openPrinterModal = async () => {
    setShowPrinterModal(true);
    setPrinterWorkflowError("");
    setPrinterWorkflowStatus("Initialisation du module d'impression...");
    await scanBluetoothPrinters();
  };

  const launchPrinterWorkflow = async () => {
    try {
      const savedPrinterJson = await SecureStore.getItemAsync(SAVED_PRINTER_KEY);
      if (savedPrinterJson) {
        const savedPrinter = JSON.parse(savedPrinterJson);
        const success = await printReceiptForPrinter(savedPrinter);
        if (success) return;
      }
    } catch (error) {
      console.error("Error reading saved printer:", error);
    }

    // Si pas d'imprimante sauvegardée ou si l'impression a échoué
    await openPrinterModal();
  };

  const handlePrintAction = async () => {
    await launchPrinterWorkflow();
  };

  const printReceiptForPrinter = async (printerDevice) => {
    if (!printerDevice?.target) {
      setPrinterWorkflowStatus("Imprimante introuvable.");
      setPrinterWorkflowError(
        "Impossible de récupérer cette imprimante.",
      );
      return false;
    }

    let printerInstance;

    setPrinterWorkflowError("");
    setPrinterWorkflowStatus(
      `Connexion à ${printerDevice.deviceName || "l'imprimante"}...`,
    );
    setSelectedPrinterTarget(printerDevice.target);
    setIsPrintingReceipt(true);

    try {
      await stopPrinterDiscoverySafely();

      printerInstance = new Printer({
        target: printerDevice.target,
        deviceName: printerDevice.deviceName || "Imprimante Bluetooth",
        lang: PrinterConstants.MODEL_ANK,
      });

      const restaurantLabel =
        displayedRestaurantName && displayedRestaurantName !== "Non assignée"
          ? displayedRestaurantName
          : "Le Courteau";
      const paymentLabel = paymentMethodLabel;

      await printerInstance.addQueueTask(async () => {
        setPrinterWorkflowStatus("Connexion à l'imprimante...");
        await connectPrinterWithRetries(printerInstance);
        setPrinterWorkflowStatus("Préparation du reçu...");
        await printerInstance.clearCommandBuffer();

        await printerInstance.addTextSmooth(PrinterConstants.TRUE);
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);

        // 1. Nom du restaurant
        await printerInstance.addTextStyle({ em: PrinterConstants.TRUE });
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await appendReceiptText(printerInstance, restaurantLabel);

        // 2. Numero de commande
        await printerInstance.addTextStyle({ em: PrinterConstants.FALSE });
        await printerInstance.addTextSize({ width: 1, height: 1 });
        const clientCodeLine = ` Commande #${order.code || "—"} `;
        await printerInstance.addTextStyle({
          reverse: PrinterConstants.TRUE,
          em: PrinterConstants.TRUE,
        });
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await appendReceiptText(printerInstance, clientCodeLine);
        await printerInstance.addTextStyle({
          reverse: PrinterConstants.FALSE,
          em: PrinterConstants.FALSE,
        });
        await printerInstance.addTextSize({ width: 1, height: 1 });

        // 3. Type de commande / client / adresse / paiement
        const typeLabel = isDeliveryOrder ? "LIVRAISON" : "RAMASSAGE";
        const clientNameRaw = order?.user?.name || "Client";
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_LEFT);
        await appendReceiptText(printerInstance, typeLabel);
        await appendReceiptText(printerInstance, `Client: ${clientNameRaw}`);
        if (isDeliveryOrder && order?.address) {
          await appendReceiptText(printerInstance, `Adresse: ${order.address}`);
        }
        if (isDeliveryOrder && customerPhone) {
          await appendReceiptText(printerInstance, `Telephone: ${customerPhone}`);
        }
        await appendReceiptText(printerInstance, `Paiement: ${paymentLabel}`);
        await printerInstance.addFeedLine(1);

        // 4. Trait
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_LEFT);
        await appendReceiptDivider(printerInstance);

        // 5. Articles
        if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
          for (const item of order.orderItems) {
            const itemLabel = buildReceiptItemLabel({
              name: item?.item?.name || "Article",
              size: item?.size,
              quantity: item?.quantity,
            });

            await appendReceiptLine(
              printerInstance,
              itemLabel,
              formatReceiptMoney(item?.price, { freeWhenZero: true }),
              { large: true },
            );

            if (Array.isArray(item?.customizations)) {
              for (const cust of item.customizations) {
                await appendReceiptLine(
                  printerInstance,
                  `  + ${cust.name}`,
                  formatReceiptMoney(cust.price, { freeWhenZero: true }),
                );
              }
            }

            if (item?.comment && item.comment !== "—") {
              await appendReceiptText(printerInstance, `  Note: ${item.comment}`);
            }
            await printerInstance.addFeedLine(1);
          }
        }

        // 6. Offres
        if (Array.isArray(order.offers) && order.offers.length > 0) {
          for (const offer of order.offers) {
            await appendReceiptLine(
              printerInstance,
              offer?.offer?.name || "Offre",
              formatReceiptMoney(offer?.price),
              { large: true },
            );

            if (Array.isArray(offer?.items)) {
              for (const [offerItemIndex, offerItem] of offer.items.entries()) {
                await appendReceiptText(
                  printerInstance,
                  `  - ${buildReceiptItemLabel({
                    name: offerItem?.item?.name || "Article",
                    size: resolveOfferItemReceiptSize(
                      offer,
                      offerItem,
                      offerItemIndex,
                    ),
                  })}`,
                  { large: true },
                );
                if (Array.isArray(offerItem?.customizations)) {
                  for (const cust of offerItem.customizations) {
                    await appendReceiptLine(
                      printerInstance,
                      `    + ${cust.name}`,
                      formatReceiptMoney(cust.price, { freeWhenZero: true }),
                    );
                  }
                }
              }
            }
            await printerInstance.addFeedLine(1);
          }
        }

        // 7. Récompenses et cadeaux
        if (Array.isArray(order.rewards) && order.rewards.length > 0) {
          for (const reward of order.rewards) {
            await appendReceiptLine(
              printerInstance,
              reward?.item?.name || "Cadeau",
              "0.00 $",
            );
          }
          await printerInstance.addFeedLine(1);
        }

        // 8. Remises detaillees
        if (hasPromoCode && (promoLineValue || hasFreeItemPromo)) {
          await appendReceiptLine(
            printerInstance,
            promoLineLabel,
            promoLineValue || "Offert",
          );
          await printerInstance.addFeedLine(1);
        }

        if (showSubscriptionDiscountInfo && subscriptionDiscountAmount > 0) {
          await appendReceiptLine(
            printerInstance,
            `Rabais abonnement (-${subscriptionDiscountPercentDisplay}%)`,
            `-${formatReceiptMoney(subscriptionDiscountAmount)}`,
          );
          await printerInstance.addFeedLine(1);
        }

        if (isFirstOrderDiscountApplied && firstOrderDiscountAmount > 0) {
          await appendReceiptLine(
            printerInstance,
            `Rabais 1re commande (-${orderDiscountPercent}%)`,
            `-${formatReceiptMoney(firstOrderDiscountAmount)}`,
          );
          await printerInstance.addFeedLine(1);
        }

        if (genericPromotionAmount > 0.01) {
          await appendReceiptLine(
            printerInstance,
            "Promotion",
            `-${formatReceiptMoney(genericPromotionAmount)}`,
          );
          await printerInstance.addFeedLine(1);
        }

        if (referralDiscountAmount > 0) {
          await appendReceiptLine(
            printerInstance,
            "Credit parrainage",
            `-${formatReceiptMoney(referralDiscountAmount)}`,
          );
          await printerInstance.addFeedLine(1);
        }

        // 9. Trait
        await appendReceiptDivider(printerInstance);

        // 10. Sous-total
        await appendReceiptLine(
          printerInstance,
          "Sous-total",
          formatReceiptMoney(normalizedSubtotal),
        );

        // 11. Taxes (Combine TPS et TVQ)
        const combinedTaxes = toSafeNumber(tvq, 0) + toSafeNumber(tps, 0);
        await appendReceiptLine(printerInstance, "Taxes", formatReceiptMoney(combinedTaxes));

        // Frais de livraison (si applicable)
        if (isDeliveryOrder && displayedDeliveryFee > 0) {
          await appendReceiptLine(
            printerInstance,
            "Livraison",
            formatReceiptMoney(displayedDeliveryFee),
          );
        }

        // 12. Montant payé
        await printerInstance.addTextStyle({ em: PrinterConstants.TRUE });
        await appendReceiptLine(
          printerInstance,
          "Montant paye",
          formatReceiptMoney(normalizedTotalPrice),
        );
        await printerInstance.addTextStyle({ em: PrinterConstants.FALSE });

        // 13. Trait
        await appendReceiptDivider(printerInstance);

        // 14. Transaction date
        await appendReceiptText(
          printerInstance,
          `Transaction passe le ${formatTransactionDate(order.createdAt)}`,
        );

        // 15 & 16. Trait Trait
        await appendReceiptDivider(printerInstance);
        await appendReceiptDivider(printerInstance);

        // 17. Message de remerciement
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
        await appendReceiptText(printerInstance, "Merci pour votre commande");
        await appendReceiptText(printerInstance, "Le Courteau");

        await printerInstance.addFeedLine(3);
        await printerInstance.addCut();
        await printerInstance.sendData();
      });

      // Sauvegarder l'imprimante comme étant fonctionnelle
      try {
        await SecureStore.setItemAsync(
          SAVED_PRINTER_KEY,
          JSON.stringify({
            target: printerDevice.target,
            deviceName: printerDevice.deviceName || "Imprimante Bluetooth",
          }),
        );
      } catch (saveError) {
        console.error("Failed to save printer:", saveError);
      }

      setPrinterWorkflowStatus(
        `Reçu envoyé à ${printerDevice.deviceName || "l'imprimante"}.`,
      );
      return true;
    } catch (error) {
      setPrinterWorkflowStatus("Impression impossible.");
      setPrinterWorkflowError(
        toPrinterWorkflowErrorMessage(
          error,
          "La connexion à l'imprimante a échoué. Vérifiez qu'elle est allumée et déjà jumelée à la tablette.",
        ),
      );
      return false;
    } finally {
      await disconnectPrinterSafely(printerInstance);
      setIsPrintingReceipt(false);
      setSelectedPrinterTarget("");
    }
  };

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

  const handleUpdateOrderRestaurant = async () => {
    if (!order?._id) {
      return;
    }

    if (!token) {
      Alert.alert(
        "Session expirée",
        "Reconnectez-vous pour changer la succursale.",
      );
      return;
    }

    const nextRestaurantId = String(selectedRestaurantId || "");
    const currentRestaurantId = String(orderRestaurantId || "");

    if (!nextRestaurantId) {
      Alert.alert(
        "Succursale manquante",
        "Sélectionnez une succursale avant de valider.",
      );
      return;
    }

    if (nextRestaurantId === currentRestaurantId) {
      Alert.alert(
        "Aucun changement",
        "La commande est déjà dans cette succursale.",
      );
      return;
    }

    setIsUpdatingRestaurant(true);
    try {
      const response = await updateOrderRestaurant(
        order._id,
        nextRestaurantId,
        token,
      );
      if (!response?.status) {
        Alert.alert(
          "Mise à jour impossible",
          response?.message ||
            "Impossible de changer la succursale de cette commande.",
        );
        return;
      }

      const apiRestaurant = response?.data?.restaurant;
      const fallbackName =
        selectedRestaurantName ||
        restaurantOptions.find((option) => option.value === nextRestaurantId)
          ?.label ||
        "Succursale";
      const nextRestaurant = apiRestaurant?._id
        ? apiRestaurant
        : { _id: nextRestaurantId, name: fallbackName };

      setOrder((prev) => ({
        ...prev,
        restaurant: nextRestaurant,
      }));
      setShowSuccessModel(true);
      setIsEditingRestaurant(false);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
        "Mise à jour impossible",
        error?.message || "Impossible de changer la succursale de la commande.",
      );
    } finally {
      setIsUpdatingRestaurant(false);
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
          uber_creation_failed: true,
          uber_creation_error:
            deliveryResponse.message || "Création Uber Direct échouée.",
          uber_creation_failed_at: new Date().toISOString(),
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
        uber_creation_failed: false,
        uber_creation_error: "",
        uber_creation_failed_at: null,
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
      <Modal
        visible={showPrinterModal}
        transparent
        animationType="fade"
        onRequestClose={closePrinterModal}
      >
        <View style={styles.printerModalOverlay}>
          <View style={styles.printerModalCard}>
            <View style={styles.printerModalHeader}>
              <View style={styles.printerModalHeaderContent}>
                <Text style={styles.printerModalTitle}>Imprimer le reçu</Text>
                <Text style={styles.printerModalSubtitle}>
                  Choisissez une imprimante Bluetooth disponible près de la
                  tablette.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.printerModalCloseButton}
                activeOpacity={0.8}
                onPress={closePrinterModal}
              >
                <Ionicons name="close" size={20} color="#1b1b1b" />
              </TouchableOpacity>
            </View>

            <View style={styles.printerModalActions}>
              <TouchableOpacity
                style={[
                  styles.uberButton,
                  (isDiscovering ||
                    isPreparingPrinterDiscovery ||
                    isPrintingReceipt) &&
                    styles.uberButtonDisabled,
                ]}
                activeOpacity={0.9}
                disabled={
                  isDiscovering ||
                  isPreparingPrinterDiscovery ||
                  isPrintingReceipt
                }
                onPress={scanBluetoothPrinters}
              >
                {isDiscovering || isPreparingPrinterDiscovery ? (
                  <ActivityIndicator size="small" color="#1b1b1b" />
                ) : (
                  <Ionicons
                    name="bluetooth-outline"
                    size={16}
                    color="#1b1b1b"
                  />
                )}
                <Text style={styles.uberButtonLabel}>
                  {isDiscovering || isPreparingPrinterDiscovery
                    ? "Recherche..."
                    : "Rechercher"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.printerHintText}>
                L'imprimante doit etre allumee, deja jumelee et la
                localisation Android doit etre activee.
              </Text>
            </View>

            {printerWorkflowStatus ? (
              <View style={styles.printerStatusCard}>
                <Text style={styles.printerStatusText}>
                  {printerWorkflowStatus}
                </Text>
              </View>
            ) : null}

            {printerVisibleErrorMessage ? (
              <View style={styles.printerErrorCard}>
                <Text style={styles.printerErrorText}>
                  {printerVisibleErrorMessage}
                </Text>
              </View>
            ) : null}

            <ScrollView
              style={styles.printerList}
              contentContainerStyle={styles.printerListContent}
              showsVerticalScrollIndicator={false}
            >
              {discoveredPrinters.length > 0 ? (
                discoveredPrinters.map((printer) => {
                  const isCurrentPrinter =
                    isPrintingReceipt &&
                    selectedPrinterTarget === printer.target;

                  return (
                    <TouchableOpacity
                      key={printer.target}
                      style={[
                        styles.printerListItem,
                        isCurrentPrinter && styles.printerListItemActive,
                      ]}
                      activeOpacity={0.9}
                      disabled={isPrintingReceipt}
                      onPress={() => printReceiptForPrinter(printer)}
                    >
                      <View style={styles.printerListItemContent}>
                        <Text style={styles.printerListItemName}>
                          {printer.deviceName || "Imprimante Bluetooth"}
                        </Text>
                        <Text style={styles.printerListItemMeta}>
                          {printer.target}
                        </Text>
                      </View>
                      {isCurrentPrinter ? (
                        <ActivityIndicator size="small" color="#1D4ED8" />
                      ) : (
                        <Ionicons
                          name="print-outline"
                          size={18}
                          color="#1D4ED8"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.printerEmptyState}>
                  <Ionicons
                    name="print-outline"
                    size={22}
                    color={Colors.tgry}
                  />
                  <Text style={styles.printerEmptyStateText}>
                    {isDiscovering || isPreparingPrinterDiscovery
                      ? "Recherche des imprimantes en cours..."
                      : "Aucune imprimante détectée pour le moment."}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <BackButton />
        <View style={styles.topCard}>
          <View style={styles.topHeaderRow}>
            <View style={styles.topHeaderContent}>
              <View style={styles.topRow}>
                <Text style={styles.pageTitle}>
                  Commande #{order.code || "—"}
                </Text>
                <View style={styles.topInlineMetaRow}>
                  <Text
                    style={[
                      styles.topInlineMetaText,
                      styles.topInlineMetaTextType,
                    ]}
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
            </View>
            <TouchableOpacity
              style={styles.printButton}
              activeOpacity={0.9}
              onPress={handlePrintAction}
            >
              <Ionicons name="print-outline" size={18} color="#1b1b1b" />
              <Text style={styles.printButtonLabel}>Imprimer</Text>
            </TouchableOpacity>
          </View>
          {isCounterPayment && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: "#FEF3C7",
                borderColor: "#F59E0B",
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.LATO_BOLD,
                  fontSize: 14,
                  color: "#92400E",
                }}
              >
                Paiement au comptoir
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.LATO_REGULAR,
                  fontSize: 12,
                  color: "#92400E",
                  marginTop: 4,
                }}
              >
                Cette commande sera payée sur place.
              </Text>
            </View>
          )}
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
          <View style={styles.orderStatusCard}>
            <Text style={styles.deliveryProviderTitle}>Succursale</Text>
            <View style={styles.uberActionsRow}>
              <View style={styles.uberStatusPill}>
                <Text style={styles.uberStatusLabel}>
                  Actuelle : {displayedRestaurantName}
                </Text>
              </View>
              {!isEditingRestaurant ? (
                <TouchableOpacity
                  style={[styles.uberButton, styles.modifyButton]}
                  activeOpacity={0.9}
                  onPress={openRestaurantEditor}
                >
                  <Ionicons name="swap-horizontal" size={16} color="#1D4ED8" />
                  <Text style={styles.modifyButtonLabel}>
                    Changer de succursale
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {isEditingRestaurant ? (
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
                    data={restaurantOptions}
                    maxHeight={220}
                    labelField="label"
                    valueField="value"
                    placeholder="Choisir une succursale"
                    value={selectedRestaurantId || null}
                    onChange={(item) => setSelectedRestaurantId(item.value)}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.uberButton,
                    isUpdatingRestaurant && styles.uberButtonDisabled,
                  ]}
                  disabled={isUpdatingRestaurant || !selectedRestaurantId}
                  activeOpacity={0.9}
                  onPress={handleUpdateOrderRestaurant}
                >
                  {isUpdatingRestaurant ? (
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
                <TouchableOpacity
                  style={[styles.uberButton, styles.modifyButton]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setIsEditingRestaurant(false);
                    setSelectedRestaurantId(String(orderRestaurantId || ""));
                  }}
                >
                  <Ionicons name="close-circle" size={16} color="#1D4ED8" />
                  <Text style={styles.modifyButtonLabel}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : null}
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
              {hasUberCreationFailure ? (
                <View style={styles.uberErrorBanner}>
                  <Ionicons name="warning" size={18} color="#B91C1C" />
                  <View style={styles.uberErrorBannerTextWrap}>
                    <Text style={styles.uberErrorBannerTitle}>
                      Création Uber Direct échouée
                    </Text>
                    <Text style={styles.uberErrorBannerText}>
                      {order?.uber_creation_error ||
                        "La livraison Uber Direct n'a pas pu être créée. Relancez Uber Direct ou choisissez un autre mode de livraison."}
                    </Text>
                  </View>
                </View>
              ) : null}
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
            </View>
          </View>
        </View>

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
                {order.orderItems?.map((item, index) =>
                  (() => {
                    const itemId = String(
                      item?.item?._id || item?.item || "",
                    ).trim();
                    const itemName = String(item?.item?.name || "")
                      .trim()
                      .toLowerCase();
                    const normalizedSubscriptionFreeItemLabel = String(
                      subscriptionFreeItemLabel,
                    )
                      .trim()
                      .toLowerCase();
                    const normalizedBirthdayFreeItemLabel = String(
                      birthdayFreeItemLabel,
                    )
                      .trim()
                      .toLowerCase();
                    const itemPrice = Number(item?.price);
                    const itemBasePrice = Number(item?.basePrice);
                    const hasPayingExtras =
                      Number.isFinite(itemPrice) && itemPrice > 0;
                    const isFreeByIdSubscription =
                      Boolean(subscriptionFreeItemId) &&
                      Boolean(itemId) &&
                      itemId === subscriptionFreeItemId;
                    const isFreeByIdBirthday =
                      Boolean(birthdayFreeItemId) &&
                      Boolean(itemId) &&
                      itemId === birthdayFreeItemId;
                    const isFreeByLabelSubscription =
                      Boolean(normalizedSubscriptionFreeItemLabel) &&
                      Boolean(itemName) &&
                      (itemName === normalizedSubscriptionFreeItemLabel ||
                        itemName.includes(
                          normalizedSubscriptionFreeItemLabel,
                        ) ||
                        normalizedSubscriptionFreeItemLabel.includes(itemName));
                    const isFreeByLabelBirthday =
                      Boolean(normalizedBirthdayFreeItemLabel) &&
                      Boolean(itemName) &&
                      (itemName === normalizedBirthdayFreeItemLabel ||
                        itemName.includes(normalizedBirthdayFreeItemLabel) ||
                        normalizedBirthdayFreeItemLabel.includes(itemName));
                    const isFreeByZeroPriceWithBase =
                      Number.isFinite(itemPrice) &&
                      itemPrice <= 0 &&
                      Number.isFinite(itemBasePrice) &&
                      itemBasePrice > 0;
                    const itemDiscountAmount =
                      Number.isFinite(itemPrice) &&
                      Number.isFinite(itemBasePrice)
                        ? Math.max(0, itemBasePrice - itemPrice)
                        : 0;
                    const isFreeByDiscountAmount =
                      subscriptionFreeItemAmount > 0 &&
                      itemDiscountAmount > 0 &&
                      Math.abs(
                        itemDiscountAmount - subscriptionFreeItemAmount,
                      ) < 0.01;
                    const isBirthdayFreeByDiscountAmount =
                      birthdayFreeItemAmount > 0 &&
                      itemDiscountAmount > 0 &&
                      Math.abs(itemDiscountAmount - birthdayFreeItemAmount) <
                        0.01;
                    const hasExplicitSubscriptionMatch =
                      subscriptionUsed &&
                      subscriptionFreeItemApplied &&
                      (Boolean(item?.isSubscriptionFreeItem) ||
                        isFreeByIdSubscription ||
                        isFreeByLabelSubscription);
                    const hasExplicitBirthdayMatch =
                      birthdayFreeItemApplied &&
                      (Boolean(item?.isBirthdayFreeItem) ||
                        isFreeByIdBirthday ||
                        isFreeByLabelBirthday);
                    const hasUniqueSubscriptionDiscountMatch =
                      subscriptionUsed &&
                      subscriptionFreeItemApplied &&
                      isFreeByDiscountAmount &&
                      !isBirthdayFreeByDiscountAmount;
                    const hasUniqueBirthdayDiscountMatch =
                      birthdayFreeItemApplied &&
                      isBirthdayFreeByDiscountAmount &&
                      !isFreeByDiscountAmount;
                    const canUseSubscriptionZeroPriceFallback =
                      subscriptionUsed &&
                      subscriptionFreeItemApplied &&
                      !birthdayFreeItemApplied &&
                      isFreeByZeroPriceWithBase;
                    const canUseBirthdayZeroPriceFallback =
                      birthdayFreeItemApplied &&
                      !subscriptionFreeItemApplied &&
                      isFreeByZeroPriceWithBase;
                    const freeItemType =
                      hasExplicitBirthdayMatch ||
                      hasUniqueBirthdayDiscountMatch ||
                      canUseBirthdayZeroPriceFallback
                        ? "birthday"
                        : hasExplicitSubscriptionMatch ||
                            hasUniqueSubscriptionDiscountMatch ||
                            canUseSubscriptionZeroPriceFallback
                          ? "subscription"
                          : null;
                    const isSubscriptionFreeItemRow =
                      freeItemType === "subscription";
                    const isBirthdayFreeItemRow = freeItemType === "birthday";
                    const isAnyFreeItemRow =
                      isBirthdayFreeItemRow || isSubscriptionFreeItemRow;
                    const rowPriceLabel = isAnyFreeItemRow
                      ? hasPayingExtras
                        ? `${itemPrice.toFixed(2)} $`
                        : "Gratuit"
                      : `${Number.isFinite(itemPrice) ? itemPrice.toFixed(2) : "0.00"} $`;

                    return (
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
                          {isBirthdayFreeItemRow ? (
                            <Text style={styles.subscriptionFreeItemLabel}>
                              {" "}
                              (cadeau anniversaire)
                            </Text>
                          ) : isSubscriptionFreeItemRow ? (
                            <Text style={styles.subscriptionFreeItemLabel}>
                              {" "}
                              (article gratuit abonnement)
                            </Text>
                          ) : null}
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
                        <Text
                          style={[
                            styles.listCell,
                            { width: 80 },
                            isAnyFreeItemRow &&
                              !hasPayingExtras &&
                              styles.freePriceLabel,
                          ]}
                        >
                          {rowPriceLabel}
                        </Text>
                      </View>
                    );
                  })(),
                )}
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
                            {buildReceiptItemLabel({
                              name: offerItem?.item?.name,
                              size: resolveOfferItemReceiptSize(item, offerItem, i),
                            })}
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
              {showSubscriptionDiscountInfo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rabais abonnement</Text>
                  <Text style={styles.infoValue}>
                    {subscriptionDiscountPercentDisplay} %
                  </Text>
                </View>
              )}
              {birthdayBenefits?.isApplied && birthdayFreeItemApplied && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cadeau anniversaire</Text>
                  <Text style={styles.infoValue}>
                    {birthdayBenefits?.freeItemLabel || "Article offert"}
                  </Text>
                </View>
              )}

              {isFirstOrderDiscountApplied && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rabais première commande</Text>
                  <Text style={styles.infoValue}>{orderDiscountPercent} %</Text>
                </View>
              )}
              {toSafeNumber(order?.referralDiscountApplied, 0) > 0 && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: "#16A34A" }]}>
                    Crédit parrainage
                  </Text>
                  <Text style={[styles.infoValue, { color: "#16A34A" }]}>
                    - {toSafeNumber(order.referralDiscountApplied, 0).toFixed(2)}{" "}
                    $
                  </Text>
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
                <Text style={styles.infoLabel}>Mode de paiement</Text>
                <Text style={styles.infoValue}>{paymentMethodLabel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total</Text>
                {updatePriceMode ? (
                  <View style={styles.valueWithIcon}>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="numeric"
                      placeholder={normalizedTotalPrice.toFixed(2)}
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
                      {normalizedTotalPrice.toFixed(2)} $
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
                  {normalizedSubtotal.toFixed(2)} $
                </Text>
              </View>

              {shouldShowDiscountedSubtotal && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Après remise</Text>
                  <Text style={styles.infoValue}>
                    {normalizedSubtotalAfterDiscount.toFixed(2)} $
                    {orderDiscountPercent > 0
                      ? ` (- ${orderDiscountPercent} %)`
                      : ""}
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
                    {displayedDeliveryFee.toFixed(2)} $
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pourboire</Text>
                <Text style={styles.infoValue}>
                  {normalizedTip.toFixed(2)} $
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
  printerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  printerModalCard: {
    width: "100%",
    maxWidth: 640,
    maxHeight: "82%",
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  printerModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  printerModalHeaderContent: {
    flex: 1,
  },
  printerModalTitle: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 28,
    color: "#1b1b1b",
  },
  printerModalSubtitle: {
    marginTop: 4,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: Colors.tgry,
  },
  printerModalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  printerModalActions: {
    marginTop: 14,
    gap: 10,
  },
  printerHintText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 12,
    color: Colors.tgry,
  },
  printerStatusCard: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(14,116,144,0.22)",
    backgroundColor: "rgba(236,254,255,0.95)",
  },
  printerStatusText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#155E75",
  },
  printerErrorCard: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(185,28,28,0.25)",
    backgroundColor: "rgba(254,226,226,0.9)",
  },
  printerErrorText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#B91C1C",
    lineHeight: 18,
  },
  printerList: {
    marginTop: 14,
    flexGrow: 0,
  },
  printerListContent: {
    gap: 10,
    paddingBottom: 4,
  },
  printerListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  printerListItemActive: {
    borderColor: "rgba(29,78,216,0.25)",
    backgroundColor: "rgba(29,78,216,0.08)",
  },
  printerListItemContent: {
    flex: 1,
    gap: 4,
  },
  printerListItemName: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#1b1b1b",
  },
  printerListItemMeta: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 12,
    color: Colors.tgry,
  },
  printerEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  printerEmptyStateText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: Colors.tgry,
    textAlign: "center",
  },
  receiptPreviewModalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "86%",
    backgroundColor: Colors.gry,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  receiptPreviewScroll: {
    marginTop: 14,
    flexGrow: 0,
  },
  receiptPreviewScrollContent: {
    paddingBottom: 4,
  },
  receiptPaper: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
  },
  receiptTitleText: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 32,
    color: "#1b1b1b",
    textAlign: "center",
  },
  receiptCenteredText: {
    marginTop: 6,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
    textAlign: "center",
  },
  receiptLeftText: {
    marginTop: 6,
    width: "100%",
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
    textAlign: "left",
  },
  receiptHighlightRow: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: "#1b1b1b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  receiptHighlightText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  receiptDividerText: {
    marginTop: 12,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: 0.4,
  },
  receiptPlainText: {
    marginTop: 6,
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#1b1b1b",
    lineHeight: 18,
  },
  receiptLineRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  receiptLineText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#1b1b1b",
    lineHeight: 18,
  },
  receiptLineLeftText: {
    flex: 1,
  },
  receiptLineRightText: {
    minWidth: 78,
    textAlign: "right",
  },
  receiptLargeLineLeftText: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    lineHeight: 20,
  },
  receiptLargeLineRightText: {
    minWidth: 82,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
  },
  receiptLineTextStrong: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
  },
  receiptLargeText: {
    marginTop: 6,
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 15,
    color: "#1b1b1b",
    lineHeight: 20,
  },
  receiptSpacer: {
    height: 6,
  },
  receiptPreviewActions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  receiptPreviewSecondaryButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptPreviewSecondaryButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
  },
  receiptPreviewPrimaryButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  receiptPreviewPrimaryButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#1b1b1b",
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
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  topHeaderContent: {
    flex: 1,
    minWidth: 260,
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
  printButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  printButtonLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
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
  uberErrorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(220,38,38,0.1)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.25)",
  },
  uberErrorBannerTextWrap: {
    flex: 1,
    gap: 3,
  },
  uberErrorBannerTitle: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 14,
    color: "#B91C1C",
  },
  uberErrorBannerText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
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
  freePriceLabel: {
    fontFamily: Fonts.LATO_BOLD,
    color: "#16A34A",
  },
  subscriptionFreeItemLabel: {
    fontFamily: Fonts.LATO_BOLD,
    color: "#B45309",
    fontSize: 12,
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
