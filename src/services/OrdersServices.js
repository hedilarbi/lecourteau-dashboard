import { API_URL } from "@env";
import axios from "axios";

const getOrders = async () => {
  try {
    let getOrdersResponse = await axios.get(`${API_URL}/orders`);

    if (getOrdersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrdersResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const orderDelivered = async (id, staffId) => {
  try {
    let orderDeliveredResponse = await axios.put(
      `${API_URL}/orders/update/delivered/${id}`,
      { staffId }
    );

    if (orderDeliveredResponse?.status === 200) {
      return {
        status: true,
        message: "order delivered",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const getOrder = async (id) => {
  try {
    let getOrderResponse = await axios.get(`${API_URL}/orders/${id}`);

    if (getOrderResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrderResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getOrderResponse?.data?.error || "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const deleteOrder = async (id) => {
  try {
    let deleteUserResponse = await axios.delete(
      `${API_URL}/orders/delete/${id}`
    );

    if (deleteUserResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const updateStatus = async (id, status, token) => {
  try {
    let updateStatusResponse = await axios.put(
      `${API_URL}/orders/update/status/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { timeout: 10000 }
    );

    if (updateStatusResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const updatePrice = async (id, price) => {
  try {
    let updatePriceResponse = await axios.put(
      `${API_URL}/orders/update/price/${id}`,
      { price },
      { timeout: 10000 }
    );

    if (updatePriceResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const confirmOrder = async (id, token) => {
  try {
    let confirmOrderResponse = await axios.put(
      `${API_URL}/orders/confirm/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (confirmOrderResponse?.status === 200) {
      return {
        status: true,
        message:
          confirmOrderResponse?.data?.message || "order confirmed",
        warning: confirmOrderResponse?.data?.warning || null,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message,
    };
  }
};
const updatePaymentStatus = async (id, payment_status) => {
  try {
    let response = await axios.put(
      `${API_URL}/orders/update/payment_status/${id}`,
      { payment_status }
    );

    if (response?.status === 200) {
      return {
        status: true,
        message: "order confirmed",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const updateDeliveryProvider = async (id, delivery_provider, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/orders/update/delivery_provider/${id}`,
      { delivery_provider },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );

    if (response?.status === 200) {
      return {
        status: true,
        message:
          response?.data?.message ||
          "Fournisseur de livraison mis à jour avec succès.",
        data: response?.data?.data || null,
      };
    }

    return {
      status: false,
      message: "Impossible de mettre à jour le fournisseur de livraison.",
    };
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Impossible de mettre à jour le fournisseur de livraison.",
    };
  }
};

const updateOrderRestaurant = async (id, restaurantId, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/orders/update/restaurant/${id}`,
      { restaurantId },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );

    if (response?.status === 200) {
      return {
        status: true,
        message:
          response?.data?.message ||
          "Succursale de la commande mise à jour avec succès.",
        data: response?.data?.data || null,
      };
    }

    return {
      status: false,
      message: "Impossible de changer la succursale de la commande.",
    };
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Impossible de changer la succursale de la commande.",
    };
  }
};

const createUberDirectDelivery = async (restaurantId, orderId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/uber-direct/restaurants/${restaurantId}/orders/${orderId}/deliveries`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );

    if (response?.status >= 200 && response?.status < 300) {
      return {
        status: true,
        message: "uber delivery created",
        data: response?.data?.data || null,
      };
    }

    return {
      status: false,
      message: "Erreur lors de la création de la livraison Uber.",
    };
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Erreur lors de la création de la livraison Uber.",
    };
  }
};

const cancelUberDirectDelivery = async (
  restaurantId,
  deliveryId,
  token,
  payload = {},
) => {
  try {
    const response = await axios.post(
      `${API_URL}/uber-direct/restaurants/${restaurantId}/deliveries/${deliveryId}/cancel`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );

    if (response?.status >= 200 && response?.status < 300) {
      return {
        status: true,
        message: "Livraison Uber annulée.",
        data: response?.data?.data || null,
      };
    }

    return {
      status: false,
      message: "Erreur lors de l'annulation de la livraison Uber.",
    };
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Erreur lors de l'annulation de la livraison Uber.",
    };
  }
};

const getOrderFiltred = async (filters) => {
  try {
    let getOrderResponse = await axios.get(`${API_URL}/orders/filter`, {
      params: { ...filters },
    });

    if (getOrderResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrderResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getOrderResponse?.data?.error || "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const getRestaurantOrderFiltred = async (id, filters) => {
  try {
    let getOrderResponse = await axios.get(`${API_URL}/orders/filter/${id}`, {
      params: { ...filters },
    });

    if (getOrderResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrderResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getOrderResponse?.data?.error || "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

export {
  getOrders,
  getOrder,
  deleteOrder,
  updatePrice,
  updateStatus,
  orderDelivered,
  confirmOrder,
  updatePaymentStatus,
  updateDeliveryProvider,
  updateOrderRestaurant,
  createUberDirectDelivery,
  cancelUberDirectDelivery,
  getOrderFiltred,
  getRestaurantOrderFiltred,
};
