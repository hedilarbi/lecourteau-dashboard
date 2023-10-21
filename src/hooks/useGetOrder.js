import React, { useEffect, useState } from "react";

import { getOrder } from "../services/OrdersServices";

const useGetOrder = (id) => {
  const [order, setOrder] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await getOrder(id);
      if (response.status) {
        setOrder(response.data);
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
  }, []);

  return { order, isLoading, setIsLoading, setOrder };
};

export default useGetOrder;
