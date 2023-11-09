import { API_URL } from "@env";
import axios from "axios";

const loginStaff = async (username, password, expoToken) => {
  try {
    let loginStaffResponse = await axios.post(`${API_URL}/staffs/login`, {
      username,
      password,
      expoToken,
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
      `${API_URL}/staffs/staffByToken/`,
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

const getStaffMembers = async () => {
  try {
    let getStaffMembersResponse = await axios.get(`${API_URL}/staffs/`);
    if (getStaffMembersResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffMembersResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};
const getStaffMember = async (id) => {
  try {
    let getStaffMemberResponse = await axios.get(`${API_URL}/staffs/${id}`);
    if (getStaffMemberResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffMemberResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};
const updateStaffMember = async (id, name, username, restaurant, role) => {
  try {
    let getStaffMemberResponse = await axios.put(
      `${API_URL}/staffs/update/${id}`,
      { name, username, restaurant, role }
    );
    if (getStaffMemberResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffMemberResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};
const deleteStaffMember = async (id) => {
  try {
    let deleteStaffMemberResponse = await axios.delete(
      `${API_URL}/staffs/delete/${id}`
    );
    if (deleteStaffMemberResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: deleteStaffMemberResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};

export {
  loginStaff,
  getStaffByToken,
  getStaffMembers,
  getStaffMember,
  deleteStaffMember,
  updateStaffMember,
};
