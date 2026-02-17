import axios from "axios";
import { API_URL } from "@env";

const getSizesGroups = async () => {
  try {
    let response = await axios.get(`${API_URL}/sizeGroups/`);

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
    console.log(error.response);
    return {
      status: false,
      message: error.response.data.error,
    };
  }
};
const createSizeGroup = async (name, sizes) => {
  try {
    let response = await axios.post(`${API_URL}/sizeGroups/`, { name, sizes });

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
      message: error.response.data,
    };
  }
};
const deleteSizeGroupService = async (id) => {
  try {
    let response = await axios.delete(`${API_URL}/sizeGroups/${id}`);

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

const updateSizeGroup = async (id, name, addSizes, removeSizes) => {
  try {
    let response = await axios.put(`${API_URL}/sizeGroups/${id}`, {
      name,
      addSizes,
      removeSizes,
    });

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
      message: error.response.data,
    };
  }
};

const getSizeGroup = async (id) => {
  try {
    let response = await axios.get(`${API_URL}/sizeGroups/${id}`);

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
      message: error.response.data.error,
    };
  }
};
export {
  getSizesGroups,
  deleteSizeGroupService,
  createSizeGroup,
  updateSizeGroup,
  getSizeGroup,
};
