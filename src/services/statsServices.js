import { API_URL } from "@env";
import axios from "axios";

const getInitialStats = async (date, from, to, token) => {
  try {
    let getInitialStatsResponse = await axios.get(`${API_URL}/stats/initial`, {
      params: {
        date,
        from,
        to,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (getInitialStatsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getInitialStatsResponse?.data,
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
const getRestaurantStats = async (id, token) => {
  try {
    let getInitialStatsResponse = await axios.get(
      `${API_URL}/stats/initial/${id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    if (getInitialStatsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getInitialStatsResponse?.data,
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

export { getInitialStats, getRestaurantStats };
