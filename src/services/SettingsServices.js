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

const updateSettings = async (settings) => {
  try {
    let updateSettingsResponse = await axios.put(
      `${API_URL}/settings/update/${settings._id}`,
      {
        settings,
      }
    );

    if (updateSettingsResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: updateSettingsResponse?.data,
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

export { getSettings, updateSettings };
