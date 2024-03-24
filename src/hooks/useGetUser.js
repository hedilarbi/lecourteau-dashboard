import React, { useEffect, useState } from "react";
import { getUser, getUsers } from "../services/UsersServices";

const useGetUser = (id) => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const fetchData = async () => {
    setError(false);
    try {
      const response = await getUser(id);
      if (response.status) {
        setUser(response.data);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [refresh]);

  return { user, isLoading, error, setRefresh };
};

export default useGetUser;
