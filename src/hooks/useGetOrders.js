import React, { useEffect, useState } from "react";

import { getOrders } from "../services/OrdersServices";

const useGetOrders = (setIsLoading, refresh) => {
  const [orders, setOrders] = useState([]);
  const fetchData = async () => {
    getOrders().then((response) => {
      if (response?.status) {
        setOrders(response?.data);
      } else {
      }
    });
  };
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  }, [refresh]);

  return { orders, setOrders, ordersList: orders };
};

export default useGetOrders;
