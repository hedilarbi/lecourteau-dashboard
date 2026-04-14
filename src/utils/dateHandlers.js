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

const convertDateToDDMMYYYYHHMM = (dateInString) => {
  const date = new Date(dateInString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export {
  convertDate,
  convertDateToDate,
  convertDateToDDMMYYYY,
  convertDateToDDMMYYYYHHMM,
};
