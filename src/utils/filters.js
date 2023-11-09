const filterUsers = (list, text) => {
  const newList = list.filter((item) => {
    return item.phone_number.includes(text);
  });
  return newList;
};

const filterMenuItems = (list, text) => {
  const newList = list.filter((item) => {
    return item.name.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};
const filterToppings = (list, text) => {
  const newList = list.filter((item) => {
    return item.name.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};
const filterOffers = (list, text) => {
  const newList = list.filter((item) => {
    return item.name.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};
const filterRestaurantOffers = (list, text) => {
  const newList = list.filter((item) => {
    return item.offer.name.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};
const filterRestaurantToppings = (list, text) => {
  const newList = list.filter((item) => {
    return item.topping.name.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};
const filterOrdersByCode = (list, text) => {
  const newList = list.filter((item) => {
    return item.code.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};
const filterRestaurantMenuItems = (list, text) => {
  const newList = list.filter((item) => {
    return item.menuItem.name.toLowerCase().includes(text.toLowerCase());
  });
  return newList;
};

export {
  filterMenuItems,
  filterUsers,
  filterRestaurantMenuItems,
  filterOrdersByCode,
  filterToppings,
  filterRestaurantToppings,
  filterOffers,
  filterRestaurantOffers,
};
