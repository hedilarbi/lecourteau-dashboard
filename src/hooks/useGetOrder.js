import React, { useEffect, useState } from "react";

import { getOrder } from "../services/OrdersServices";

const useGetOrder = (id) => {
  const [order, setOrder] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const fetchData = async () => {
    setError(false);
    try {
      const response = await getOrder(id);
      if (response.status) {
        setOrder(response.data);
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

  return { order, isLoading, setIsLoading, setOrder, setRefresh, error };
};

export default useGetOrder;
