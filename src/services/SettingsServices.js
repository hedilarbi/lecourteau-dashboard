import { API_URL } from "@env";
import axios from "axios";

const getSettings = async () => {
  try {
    let getSettingsResponse = await axios.get(`${API_URL}/settings`);

    if (getSettingsResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: getSettingsResponse?.data,
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

const updateSettings = async (id, settings) => {
  try {
    let response = await axios.put(
      `${API_URL}/restaurants/update/settings/${id}`,
      {
        settings,
      }
    );

    if (response?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message,
    };
  }
};

export { getSettings, updateSettings };
