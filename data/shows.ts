export type Show = {
  date: string;
  venue: string;
  location: string;
  supportingActs?: string[];
  ticketsUrl?: string;
};

export const shows: Show[] = [
  {
    date: "July 25, 2026",
    venue: "West Side Bowl",
    location: "Youngstown, OH",
  },
  {
    date: "September 12, 2026",
    venue: "Waterloo Arts Fest",
    location: "Cleveland, OH",
  },
];

export function getUpcomingShows(): Show[] {
  return shows.filter(
    (show) => new Date(show.date) >= new Date(new Date().toDateString())
  );
}
