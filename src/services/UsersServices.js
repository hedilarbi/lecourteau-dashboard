import { API_URL } from "@env";
import axios from "axios";

const getUsers = async () => {
  try {
    let getUsersResponse = await axios.get(`${API_URL}/users`);

    if (getUsersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getUsersResponse?.data,
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

const getUsersPagination = async (page, limit, name) => {
  try {
    let getUsersResponse = await axios.get(`${API_URL}/users/pagination`, {
      params: { page, limit, name },
    });

    if (getUsersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getUsersResponse?.data,
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

const getUser = async (id) => {
  try {
    let getUserResponse = await axios.get(`${API_URL}/users/${id}`);

    if (getUserResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getUserResponse?.data,
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

const deleteUser = async (id) => {
  try {
    let deleteUserResponse = await axios.delete(
      `${API_URL}/users/delete/${id}`
    );

    if (deleteUserResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
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

export { getUsers, getUser, deleteUser, getUsersPagination };
