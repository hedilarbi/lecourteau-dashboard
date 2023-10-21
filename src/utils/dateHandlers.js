const convertDate = (dateInString) => {
  const date = new Date(dateInString);
  return date.toLocaleString("fr-FR");
};

const convertDateToDate = (dateInString) => {
  const date = new Date(dateInString);
  return date.toLocaleDateString("fr-FR");
};

export { convertDate, convertDateToDate };
