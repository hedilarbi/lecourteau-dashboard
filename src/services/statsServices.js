import { API_URL } from "@env";
import axios from "axios";

const getInitialStats = async () => {
  try {
    let getInitialStatsResponse = await axios.get(`${API_URL}/stats/initial`);

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

export { getInitialStats };
