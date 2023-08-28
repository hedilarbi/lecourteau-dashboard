import React, { useEffect, useState } from "react";

import { getMenuItems } from "../services/MenuItemServices";

const useGetMenuItems = (setIsLoading, refresh) => {
  return { menuItems, setMenuItems, menuItemsList };
};

export default useGetMenuItems;
