import { API_URL } from "@env";
import axios from "axios";

const loginStaff = async (username, password, expoToken) => {
  try {
    let loginStaffResponse = await axios.post(
      `${API_URL}/staffs/login`,
      {
        username,
        password,
        expoToken,
      },
      {
        timeout: 10000, // 10 seconds
      }
    );

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
const affectOrderToStaff = async (orderId, staffId) => {
  try {
    let affectOrderToStaffResponse = await axios.put(
      `${API_URL}/staffs/affectOrder/${staffId}`,
      {
        orderId,
      }
    );

    if (affectOrderToStaffResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: affectOrderToStaffResponse.data,
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

const getAvailableDrivers = async () => {
  try {
    let getAvailableDriversResponse = await axios.get(
      `${API_URL}/staffs/available`
    );
    if (getAvailableDriversResponse.status === 200) {
      return {
        status: true,

        data: getAvailableDriversResponse.data,
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
const getStaffOrder = async (id) => {
  try {
    let getStaffOrderResponse = await axios.get(
      `${API_URL}/staffs/${id}/order`
    );
    if (getStaffOrderResponse.status === 200) {
      return {
        status: true,

        data: getStaffOrderResponse.data,
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

const getDriverOrders = async (id) => {
  try {
    let getDriverOrderResponse = await axios.get(
      `${API_URL}/staffs/driver/orders/${id}`
    );
    if (getDriverOrderResponse.status === 200) {
      return {
        status: true,

        data: getDriverOrderResponse.data,
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
  affectOrderToStaff,
  getAvailableDrivers,
  getStaffOrder,
  getDriverOrders,
};
