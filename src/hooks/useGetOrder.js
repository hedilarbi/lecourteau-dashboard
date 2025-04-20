import React, { useEffect, useState } from "react";

import { getOrder } from "../services/OrdersServices";

const useGetOrder = (id) => {
  const [order, setOrder] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [tvq, setTvq] = useState(0);
  const [tps, setTps] = useState(0);
  const fetchData = async () => {
    setError(false);
    try {
      const response = await getOrder(id);
      if (response.status) {
        const data = response.data;
        setOrder(data);
        if (data.discount > 0) {
          setTvq(data.sub_total_after_discount * 0.09975);
          setTps(data.sub_total_after_discount * 0.05);
        } else {
          setTvq(data.sub_total * 0.09975);
          setTps(data.sub_total * 0.05);
        }
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

  return {
    order,
    isLoading,
    setIsLoading,
    setOrder,
    setRefresh,
    error,
    tps,
    tvq,
  };
};

export default useGetOrder;
