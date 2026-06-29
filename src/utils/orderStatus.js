export const DELIVERED_STATUS_VALUE = "Livreé";
export const DELIVERED_STATUS_LABEL = "Livrée";

const normalizeStatusText = (status) =>
  String(status || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const isDeliveredOrderStatus = (status) =>
  normalizeStatusText(status) === "livree";

export const formatOrderStatus = (status) =>
  isDeliveredOrderStatus(status) ? DELIVERED_STATUS_LABEL : status;

export const normalizeOrderStatusValue = (status) =>
  isDeliveredOrderStatus(status) ? DELIVERED_STATUS_VALUE : status;
