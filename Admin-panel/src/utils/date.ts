export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "-";

  if (typeof dateString === "string") {
    const dd_mm_yyyy_regex = /^(\d{2})-(\d{2})-(\d{4})$/;

    if (dd_mm_yyyy_regex.test(dateString)) {
      return dateString;
    }
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    if (typeof dateString === "string") {
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
          return `${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}-${parts[2]}`;
        }
      }
    }
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${strHours}:${minutes} ${ampm}`;
};

export const formatDateForPayload = (date: Date | null | undefined): string | undefined => {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
