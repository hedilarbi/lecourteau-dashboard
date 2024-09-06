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
const updateStatus = async (id, status) => {
  try {
    let updateStatusResponse = await axios.put(
      `${API_URL}/orders/update/status/${id}`,
      { status },
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

const confirmOrder = async (id) => {
  try {
    let confirmOrderResponse = await axios.put(
      `${API_URL}/orders/confirm/${id}`
    );

    if (confirmOrderResponse?.status === 200) {
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

export {
  getOrders,
  getOrder,
  deleteOrder,
  updatePrice,
  updateStatus,
  orderDelivered,
  confirmOrder,
};
