export type RecCategory =
  | "sleep"
  | "food-post-show"
  | "breakfast"
  | "coffee"
  | "vegan"
  | "explore"
  | "quiet-drinks"
  | "gear"
  | "entertainment";

export type Rec = {
  name: string;
  address?: string;
  description: string;
  category: RecCategory;
  tags: string[];
  hours?: string;
  closedDays?: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  venueNotes: Partial<Record<string, string>>;
  phone?: string;
  url?: string;
  prefix?: string; // e.g. "Backup if it's full:" or "Downtown option:"
};

const clevelandRecs: Rec[] = [
  // --- Sleep ---
  {
    name: "Courtyard by Marriott",
    address: "5101 West Creek Rd, Independence",
    description:
      "~20 min south of the venue, right off I-77/480. Plenty of parking, safe area for a loaded van.",
    category: "sleep",
    tags: ["touring-friendly", "free-parking"],
    venueNotes: {
      mahalls: "~20 min south, off I-77/480",
    },
  },
  {
    name: "Holiday Inn Cleveland South",
    address: "6001 Rockside Rd, Independence",
    description:
      "Same area, same idea. Secure lot, easy highway access.",
    category: "sleep",
    tags: ["touring-friendly", "free-parking"],
    venueNotes: {
      mahalls: "~20 min south, off I-77/480",
    },
  },
  {
    name: "Embassy Suites by Hilton",
    address: "5800 Rockside Woods Blvd, Independence",
    description:
      "If you want a little more room. Suites with separate living area, free breakfast, good lot.",
    category: "sleep",
    tags: ["touring-friendly", "free-parking"],
    venueNotes: {
      mahalls: "~20 min south, off I-77/480",
    },
  },

  // --- Food, Post-Show ---
  {
    name: "Happy Dog",
    address: "5801 Detroit Ave",
    description: "Hot dogs with weird toppings, live music most nights. Kitchen open late.",
    category: "food-post-show",
    tags: ["late-night"],
    venueNotes: {
      mahalls: "About 10 min east, in Gordon Square",
    },
  },
  {
    name: "Angelo\u2019s Pizza",
    address: "13715 Madison Ave, Lakewood",
    description: "Lakewood institution. Open late.",
    category: "food-post-show",
    tags: ["late-night"],
    venueNotes: {
      mahalls: "On Madison Ave, minutes from the venue",
    },
  },
  {
    name: "Mars Bar & Cafe",
    address: "15314 Madison",
    description:
      "Kitchen open until 2am every day, dedicated late-night menu midnight\u20132am.",
    category: "food-post-show",
    tags: ["late-night"],
    venueNotes: {
      mahalls: "On Madison Ave, minutes from the venue",
    },
  },
  {
    name: "LBM",
    address: "12301 Madison",
    description:
      "Kitchen \u2018til 11:30pm weekdays, 1:30pm weekends. Closest to the venue.",
    category: "food-post-show",
    tags: ["late-night"],
    venueNotes: {
      mahalls: "Closest restaurant to the venue",
    },
  },

  // --- Breakfast ---
  {
    name: "The Judith",
    address: "5222 Lorain Ave, Detroit-Shoreway",
    description:
      "French-inspired caf\u00e9, open Wed\u2013Sun from 8am.",
    category: "breakfast",
    tags: ["morning-after"],
    closedDays: [1, 2],
    venueNotes: {
      mahalls: "About 10 min east of Mahall\u2019s",
      "grog-shop": "About 20 min west",
    },
  },

  // --- Coffee ---
  {
    name: "Vessel Coffee Collaborative",
    address: "5019 Detroit Ave, Gordon Square",
    description:
      "Multi-roaster caf\u00e9, rotating menu of US specialty coffee.",
    category: "coffee",
    tags: ["coffee"],
    venueNotes: {
      mahalls: "~10 min east of Mahall\u2019s",
    },
  },
  {
    name: "Rising Star Coffee",
    address: "13380 Madison Ave, Lakewood",
    category: "coffee",
    tags: ["coffee"],
    description: "Right around the corner from the venue.",
    venueNotes: {
      mahalls: "Walking distance from Mahall\u2019s",
    },
  },
  {
    name: "Atmos Coffee",
    address: "5509 Detroit Ave, Gordon Square",
    category: "coffee",
    tags: ["coffee"],
    description: "Roastery cafe in Gordon Square. Good espresso, good space.",
    venueNotes: {
      mahalls: "~10 min east of Mahall\u2019s",
    },
  },

  // --- Vegan / Vegetarian ---
  {
    name: "Cleveland Vegan",
    address: "17112 Detroit Ave, Lakewood",
    description: "Fully vegan cafe and bakery.",
    category: "vegan",
    tags: ["vegan"],
    venueNotes: {
      mahalls: "Walkable from Mahall\u2019s",
    },
  },
  {
    name: "Root Cafe",
    address: "15118 Detroit Ave, Lakewood",
    description:
      "Fully vegan/vegetarian, organic, open 8am\u20138pm every day, also functions as a community space.",
    category: "vegan",
    tags: ["vegan", "vegetarian"],
    venueNotes: {
      mahalls: "In Lakewood, close to the venue",
    },
  },

  // --- Explore ---
  {
    name: "Cleveland Museum of Art",
    address: "11150 East Blvd, University Circle",
    description:
      "Free admission, world-class collection. The right answer if you want something quiet between soundcheck and doors.",
    category: "explore",
    tags: ["free", "daytime"],
    venueNotes: {
      mahalls: "About 20 min east, in University Circle",
      "grog-shop": "5 min south, basically next door",
    },
  },
  {
    name: "Edgewater Park",
    address: "6500 Cleveland Memorial Shoreway",
    description:
      "Free lakefront. Worth 15 min in the early afternoon.",
    category: "explore",
    tags: ["free", "outdoors"],
    venueNotes: {
      mahalls: "10 min north of Mahall\u2019s",
    },
  },
  {
    name: "West Side Market",
    address: "1979 W 25th St, Ohio City",
    description:
      "Cleveland\u2019s iconic public market. Closed Thursdays.",
    category: "explore",
    tags: ["daytime", "food"],
    closedDays: [0, 2, 4],
    hours: "Mon/Wed/Fri/Sat 7am\u20134pm",
    venueNotes: {
      mahalls: "About 15 min east, in Ohio City",
    },
  },

  // --- Quiet Drinks ---
  {
    name: "La Cave Du Vin",
    address: "710 Jefferson Ave, Tremont",
    description:
      "Wine bar, the right spot if anyone wants to actually talk after the show instead of yelling over a band.",
    category: "quiet-drinks",
    tags: ["post-show", "quiet"],
    venueNotes: {
      mahalls: "About 15 min east, in Tremont",
    },
  },

  // --- Gear & Records ---
  {
    name: "Guitar Riot",
    address: "4517 Lorain Ave, Ste A",
    description:
      "Best guitar shop by far. Closes at 6pm day-of-show, so call ahead Wed/Thu morning if anything\u2019s already fragile.",
    category: "gear",
    tags: ["guitars", "gear", "repair"],
    hours: "Tue\u2013Thu 11\u20136, Fri\u2013Sat 11\u20135, closed Sun/Mon",
    closedDays: [0, 1],
    phone: "(216) 291-7172",
    venueNotes: {
      mahalls: "~10 min east of Mahall\u2019s, on Lorain Ave",
    },
  },

  // --- Entertainment ---
  {
    name: "Hausfrau Record Shop",
    address: "4601 Lorain Ave",
    description: "Upstairs at Visible Voice Books. One block from Guitar Riot.",
    category: "entertainment",
    tags: ["vinyl", "records"],
    venueNotes: {
      mahalls: "~10 min east of Mahall\u2019s, on Lorain Ave",
    },
  },
  {
    name: "Visible Voice Books",
    address: "4601 Lorain Ave",
    description: "Independent bookstore downstairs from Hausfrau. Good selection, good vibe.",
    category: "entertainment",
    tags: ["books", "shopping"],
    venueNotes: {
      mahalls: "~10 min east of Mahall\u2019s, on Lorain Ave",
    },
  },
];

export default clevelandRecs;
