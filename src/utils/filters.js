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

export { filterMenuItems, filterUsers };
