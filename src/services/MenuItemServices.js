import { ApiUrl } from "../constants";
import axios from "axios";

const getMenuItems = async () => {
  try {
    let getMenuItemsResponse = await axios.get(`${ApiUrl}/menuItems`);

    if (getMenuItemsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getMenuItemsResponse?.data,
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

const createMenuItemsCategory = async (name) => {
  try {
    let createMenuItemsCategoryResponse = await axios.post(
      `${ApiUrl}/categories/create`,
      { name }
    );

    if (createMenuItemsCategoryResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: createMenuItemsCategoryResponse?.data,
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

const getCategories = async () => {
  try {
    let getCategoriesResponse = await axios.get(`${ApiUrl}/categories/`);

    if (getCategoriesResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getCategoriesResponse?.data,
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

const createMenuItem = async (
  name,
  prices,
  customization,
  category,
  description
) => {
  try {
    let createMenuItemResponse = await axios.post(
      `${ApiUrl}/menuItems/create`,
      { name, prices, customization, category, description }
    );

    if (createMenuItemResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: createMenuItemResponse?.data,
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

const getItemsNames = async () => {
  try {
    let getItemsNamesResponse = await axios.get(`${ApiUrl}/menuItems/name`);

    if (getItemsNamesResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getItemsNamesResponse?.data,
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

const deleteMenuItem = async (id) => {
  try {
    let deleteMenuItemResponse = await axios.delete(
      `${ApiUrl}/menuItems/delete/${id}`
    );

    if (deleteMenuItemResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
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

const getMenuItem = async (id) => {
  try {
    let getMenuItemResponse = await axios.get(`${ApiUrl}/menuItems/${id}`);

    if (getMenuItemResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getMenuItemResponse?.data,
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

const updateMenuItem = async (
  id,
  image,
  name,
  description,
  category,
  prices,
  customization
) => {
  try {
    let updateMenuItemResponse = await axios.put(
      `${ApiUrl}/menuItems/update/${id}`,
      { image, name, description, category, prices, customization },
      { timeout: 10000 }
    );

    if (updateMenuItemResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: updateMenuItemResponse?.data,
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
  getMenuItems,
  createMenuItemsCategory,
  getCategories,
  createMenuItem,
  getItemsNames,
  deleteMenuItem,
  getMenuItem,
  updateMenuItem,
};
