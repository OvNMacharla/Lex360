// src/utils/helpers.js
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
