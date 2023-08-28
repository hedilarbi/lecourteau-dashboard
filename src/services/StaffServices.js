import { ApiUrl } from "../constants";
import axios from "axios";

const loginStaff = async (username, password) => {
  try {
    let loginStaffResponse = await axios.post(`${ApiUrl}/staffs/login`, {
      username,
      password,
    });

    if (loginStaffResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: loginStaffResponse.data,
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
      message: error.response.data.message,
    };
  }
};
const getStaffByToken = async (token) => {
  try {
    let getStaffByTokenResponse = await axios.get(
      `${ApiUrl}/staff/userByToken/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (getStaffByTokenResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffByTokenResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
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

export { loginStaff, getStaffByToken };
