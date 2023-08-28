const convertDate = (dateInString) => {
  const date = new Date(dateInString);
  return date.toLocaleString("fr-FR");
};

export { convertDate };
