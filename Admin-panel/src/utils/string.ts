export const truncate = (str: string, maxLength: number = 30): string => {
  if (!str) return "";
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};
