export function timeAgo(date) {
  if (!date) return "";

  // If the backend sends a raw ISO string without a timezone, the browser will parse it as local time.
  // We append 'Z' to force the browser to interpret it as UTC.
  let dateString = date;
  if (typeof date === "string" && !date.endsWith("Z") && !date.match(/[+-]\d{2}:\d{2}$/)) {
    dateString += "Z";
  }

  const now = new Date();
  const past = new Date(dateString);
  let secondsAgo = Math.floor((now - past) / 1000);

  // Fallback for slight clock sync issues (e.g. negative seconds)
  if (secondsAgo < 0) secondsAgo = 0;

  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) return `${daysAgo} days ago`;
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) return `${monthsAgo} months ago`;
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo} years ago`;
}
