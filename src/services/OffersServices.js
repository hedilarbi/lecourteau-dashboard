import { ApiUrl } from "../constants";
import axios from "axios";

const getOffers = async () => {
  try {
    let getOffersResponse = await axios.get(`${ApiUrl}/offers`);

    if (getOffersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOffersResponse?.data,
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

const createOffer = async (name, items, price, expireAt, customizations) => {
  try {
    let createOfferResponse = await axios.post(`${ApiUrl}/offers/create`, {
      name,
      items,
      price,
      expireAt,
      customizations,
    });

    if (createOfferResponse?.status === 201) {
      return {
        status: true,
        message: "users data",
        data: createOfferResponse?.data,
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

const getOffer = async (id) => {
  try {
    let getOfferResponse = await axios.get(`${ApiUrl}/offers/${id}`);

    if (getOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOfferResponse?.data,
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

const deleteOffer = async (id) => {
  try {
    let deleteOfferResponse = await axios.delete(
      `${ApiUrl}/offers/delete/${id}`
    );

    if (deleteOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteOfferResponse?.data,
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

const updateOffer = async (
  id,
  name,
  price,
  exprireAt,
  items,
  customizations
) => {
  try {
    let updateOfferResponse = await axios.put(`${ApiUrl}/offers/update/${id}`, {
      name,
      price,
      exprireAt,
      items,
      customizations,
    });

    if (updateOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: updateOfferResponse?.data,
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

export { getOffers, createOffer, getOffer, deleteOffer, updateOffer };
