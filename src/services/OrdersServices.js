import { ApiUrl } from "../constants";
import axios from "axios";

const getOrders = async () => {
  try {
    let getOrdersResponse = await axios.get(`${ApiUrl}/orders`);

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

const getOrder = async (id) => {
  try {
    let getOrderResponse = await axios.get(`${ApiUrl}/orders/${id}`);

    if (getOrderResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrderResponse?.data,
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

const deleteOrder = async (id) => {
  try {
    let deleteUserResponse = await axios.delete(
      `${ApiUrl}/orders/delete/${id}`
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
      `${ApiUrl}/orders/update/status/${id}`,
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
      `${ApiUrl}/orders/update/price/${id}`,
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

export { getOrders, getOrder, deleteOrder, updatePrice, updateStatus };
