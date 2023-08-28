import React, { useEffect, useState } from "react";
import { getUser, getUsers } from "../services/UsersServices";

const useGetUser = (id) => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await getUser(id);
      if (response.status) {
        setUser(response.data);
      } else {
        console.log("getUser error");
      }
    } catch (error) {
      console.log("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    setIsLoading(false);
  }, []);

  return { user, isLoading };
};

export default useGetUser;
