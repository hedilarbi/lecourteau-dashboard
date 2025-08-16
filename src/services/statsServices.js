import { API_URL } from "@env";
import axios from "axios";

const getInitialStats = async (date, from, to) => {
  try {
    let getInitialStatsResponse = await axios.get(`${API_URL}/stats/initial`, {
      params: {
        date,
        from,
        to,
      },
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
const getRestaurantStats = async (id) => {
  try {
    let getInitialStatsResponse = await axios.get(
      `${API_URL}/stats/initial/${id}`
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
