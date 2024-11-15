import { API_URL } from "@env";
import axios from "axios";

const getSizes = async () => {
  try {
    let response = await axios.get(`${API_URL}/sizes/`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const createSize = async (name) => {
  try {
    let response = await axios.post(`${API_URL}/sizes/`, { name });

    if (response?.status === 201) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const deleteSize = async (id) => {
  try {
    let response = await axios.delete(`${API_URL}/sizes/${id}`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

export { getSizes, deleteSize, createSize };
