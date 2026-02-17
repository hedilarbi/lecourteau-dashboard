import axios from "axios";

import { API_URL } from "@env";
const getToppingGroups = async () => {
  try {
    const response = await axios.get(`${API_URL}/toppingGroups`);

    if (response?.status === 200) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur lors de la récupération" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const getToppingGroup = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/toppingGroups/${id}`);
    if (response?.status === 200) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur lors de la récupération" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const createToppingGroup = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/toppingGroups`, payload);
    if (response?.status === 201) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur lors de la création" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const updateToppingGroup = async (id, payload) => {
  try {
    const response = await axios.put(`${API_URL}/toppingGroups/${id}`, payload);
    if (response?.status === 200) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur lors de la mise à jour" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const deleteToppingGroup = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/toppingGroups/${id}`);
    if (response?.status === 200 || response?.status === 204) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur lors de la suppression" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

export {
  getToppingGroups,
  getToppingGroup,
  createToppingGroup,
  updateToppingGroup,
  deleteToppingGroup,
};
