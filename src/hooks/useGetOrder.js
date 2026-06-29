import React, { useEffect, useState } from "react";

import { getOrder } from "../services/OrdersServices";

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundMoney = (value, fallback = 0) => {
  const normalized = toSafeNumber(value, fallback);
  return Math.round(normalized * 100) / 100;
};

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
        const subscriptionBenefits =
          data?.subscriptionBenefits &&
          typeof data.subscriptionBenefits === "object"
            ? data.subscriptionBenefits
            : null;
        const normalizedSubtotal = toSafeNumber(data?.sub_total, 0);
        const normalizedSubtotalAfterDiscount = Number.isFinite(
          Number(data?.sub_total_after_discount),
        )
          ? Number(data.sub_total_after_discount)
          : normalizedSubtotal;
        const normalizedDeliveryFee =
          subscriptionBenefits?.isApplied && subscriptionBenefits?.freeDeliveryApplied
            ? 0
            : toSafeNumber(data?.delivery_fee, 0);
        const referralDiscount = toSafeNumber(data?.referralDiscountApplied, 0);
        const subtotalForTaxes = Math.max(0, normalizedSubtotalAfterDiscount - referralDiscount);

        const taxableBase = roundMoney(
          ["delivery", "devliery"].includes(
            String(data?.type || "").toLowerCase(),
          )
            ? subtotalForTaxes + normalizedDeliveryFee
            : subtotalForTaxes,
          0,
        );

        setOrder(data);
        setTvq(roundMoney(taxableBase * 0.09975, 0));
        setTps(roundMoney(taxableBase * 0.05, 0));
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
