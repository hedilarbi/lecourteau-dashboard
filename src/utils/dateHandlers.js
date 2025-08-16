const convertDate = (dateInString) => {
  const date = new Date(dateInString);
  return date.toLocaleString("fr-FR");
};

const convertDateToDate = (dateInString) => {
  const date = new Date(dateInString);
  return date.toLocaleDateString("fr-FR");
};

const convertDateToDDMMYYYY = (dateInString) => {
  const date = new Date(dateInString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export { convertDate, convertDateToDate, convertDateToDDMMYYYY };
