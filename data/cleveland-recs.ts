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
      "Plenty of parking, safe area for a loaded van.",
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
  {
    name: "Hampton Inn & Suites Cleveland-Beachwood",
    address: "3840 Orange Pl, Beachwood",
    description:
      "Well-lit business-hotel lot in a quiet suburb — the safe bet for a loaded trailer. Back it against the building and you're fine.",
    category: "sleep",
    tags: ["touring-friendly", "free-parking"],
    venueNotes: {
      "beachland-tavern": "~15 min south, right off I-271",
    },
  },
  {
    name: "Homewood Suites by Hilton Cleveland-Beachwood",
    address: "25725 Central Pkwy, Beachwood",
    description:
      "Same area, more room. Suites with a separate living area, free breakfast, same safe-lot situation.",
    category: "sleep",
    tags: ["touring-friendly", "free-parking"],
    venueNotes: {
      "beachland-tavern": "~15 min south, off I-271",
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
      "Kitchen \u2018til 11:30pm weekdays, 1:30am weekends.",
    category: "food-post-show",
    tags: ["late-night"],
    venueNotes: {
      mahalls: "Closest restaurant to the venue",
    },
  },
  {
    name: "Doinks Burger Joint",
    address: "15519 Waterloo Rd",
    description:
      "Smash burgers and house-made hard seltzers from a garage operation gone legit. Closes at 10pm — hit it before doors or right after an early set.",
    category: "food-post-show",
    tags: ["burgers"],
    hours: "Tue–Sat 4–10pm",
    closedDays: [0, 1],
    venueNotes: {
      "beachland-tavern": "On Waterloo, a block from the venue",
    },
  },
  {
    name: "Citizen Pie",
    address: "15710 Waterloo Rd",
    description:
      "Some of the best Neapolitan pizza in the city. Closes at 9pm, so it's a pre-show move. Fair warning: late-night options near Waterloo are thin — eat early, and the Beachland's own kitchen runs during shows.",
    category: "food-post-show",
    tags: ["pizza"],
    hours: "Tue–Sat 12–9pm, Sun 12–7pm",
    closedDays: [1],
    venueNotes: {
      "beachland-tavern": "Across the street from the venue",
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
  {
    name: "Inn on Coventry",
    address: "2785 Euclid Heights Blvd, Cleveland Heights",
    description:
      "Coventry Village diner \u2014 a dozen kinds of eggs Benedict, lemon ricotta pancakes. Open from 7am weekdays.",
    category: "breakfast",
    tags: ["morning-after"],
    venueNotes: {
      "beachland-tavern": "~12 min south, in Coventry Village",
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
    description: "Cleveland roaster, reliably good espresso.",
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
  {
    name: "Six Shooter Coffee",
    address: "15613 Waterloo Rd",
    description:
      "Roaster-caf\u00e9 and the neighborhood hub. Breakfast burritos and vegan pastries too.",
    category: "coffee",
    tags: ["coffee"],
    hours: "7am\u20137pm daily",
    venueNotes: {
      "beachland-tavern": "On the venue's block \u2014 walk it",
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
  {
    name: "Tommy's",
    address: "1824 Coventry Rd, Cleveland Heights",
    description:
      "Coventry institution since 1972 — massive vegan/vegetarian menu (milkshakes and spinach pies are the move), with a bookstore attached. Open 12–8 daily.",
    category: "vegan",
    tags: ["vegan", "vegetarian"],
    venueNotes: {
      "beachland-tavern": "~12 min south, in Coventry Village",
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
      "beachland-tavern": "~15 min south, in University Circle",
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
  {
    name: "Euclid Beach Park",
    address: "16301 Lakeshore Blvd",
    description:
      "Lakefront park on the site of the old amusement park \u2014 the original 1895 arch still stands. Free.",
    category: "explore",
    tags: ["free", "outdoors"],
    venueNotes: {
      "beachland-tavern": "5 min north of the venue",
    },
  },
  {
    name: "Waterloo Arts District",
    description:
      "The strip the venue sits on \u2014 galleries, murals, Waterloo Arts, Praxis Fiber Workshop. Worth a slow walk before soundcheck.",
    category: "explore",
    tags: ["free", "daytime"],
    venueNotes: {
      "beachland-tavern": "Out the front door",
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
  {
    name: "The Millard Fillmore Presidential Library",
    address: "15617 Waterloo Rd",
    description:
      "Neighborhood bar named after the most forgettable president. More easygoing dive than wine bar, but it's open 'til 2:30am and it's where the night ends up.",
    category: "quiet-drinks",
    tags: ["post-show"],
    hours: "4pm–2:30am daily",
    phone: "(216) 481-9444",
    venueNotes: {
      "beachland-tavern": "Two doors from the venue",
    },
  },

  // --- Gear & Records ---
  {
    name: "Guitar Riot",
    address: "4517 Lorain Ave, Ste A",
    description:
      "Best guitar shop by far. Closes at 6pm, so call ahead in the morning if anything\u2019s already fragile.",
    category: "gear",
    tags: ["guitars", "gear", "repair"],
    hours: "Tue\u2013Thu 11\u20136, Fri\u2013Sat 11\u20135, closed Sun/Mon",
    closedDays: [0, 1],
    phone: "(216) 291-7172",
    venueNotes: {
      mahalls: "~10 min east of Mahall\u2019s, on Lorain Ave",
      "beachland-tavern": "~25 min west \u2014 far, but it\u2019s the one worth the drive",
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
  {
    name: "Blue Arrow Records",
    address: "16001 Waterloo Rd",
    description: "Vintage vinyl and tapes \u2014 the anchor of the Waterloo strip.",
    category: "entertainment",
    tags: ["vinyl", "records"],
    venueNotes: {
      "beachland-tavern": "A block east of the venue",
    },
  },
  {
    name: "This Way Out Vintage Shoppe",
    description:
      "Vintage clothing in the Beachland's basement. Open during shows, dangerous during load-out.",
    category: "entertainment",
    tags: ["vintage", "shopping"],
    venueNotes: {
      "beachland-tavern": "Inside the venue, downstairs",
    },
  },
];

export default clevelandRecs;
