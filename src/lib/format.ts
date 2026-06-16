const dateFmt = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dateFmt.format(new Date(date));
}

export function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")} тис.`;
  return String(n);
}
