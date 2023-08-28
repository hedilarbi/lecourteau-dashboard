import React, { useEffect, useState } from "react";
import { getUsers } from "../services/UsersServices";

const useGetUsers = (setIsLoading, refresh) => {
  const [users, setUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const fetchData = async () => {
    getUsers().then((response) => {
      if (response?.status) {
        setUsers(response?.data);
        setUsersList(response?.data);
      } else {
        console.log("getUsers false");
      }
    });
  };
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  }, [refresh]);

  return { users, setUsers, usersList };
};

export default useGetUsers;
