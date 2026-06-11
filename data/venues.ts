export type Venue = {
  key: string;
  name: string;
  address: string;
  neighborhood: string;
  photo?: string;
  sleepSubtitle?: string;
};

const venues: Record<string, Venue> = {
  mahalls: {
    key: "mahalls",
    name: "Mahall\u2019s",
    address: "13200 Madison Ave, Lakewood, OH 44107",
    neighborhood: "Lakewood",
    photo: "/images/venues/mahalls.jpg",
    sleepSubtitle: "Right off I-77/480, safe parking",
  },
  "grog-shop": {
    key: "grog-shop",
    name: "The Grog Shop",
    address: "2785 Euclid Heights Blvd, Cleveland Heights, OH 44106",
    neighborhood: "Cleveland Heights",
  },
  beachland: {
    key: "beachland",
    name: "Beachland Ballroom",
    address: "15711 Waterloo Rd, Cleveland, OH 44110",
    neighborhood: "North Collinwood",
  },
  "beachland-tavern": {
    key: "beachland-tavern",
    name: "Beachland Tavern",
    address: "15711 Waterloo Rd, Cleveland, OH 44110",
    neighborhood: "North Collinwood",
    sleepSubtitle: "Beachwood, off I-271, safe parking",
  },
  "now-thats-class": {
    key: "now-thats-class",
    name: "Now That\u2019s Class",
    address: "11213 Detroit Ave, Cleveland, OH 44102",
    neighborhood: "Detroit Shoreway",
  },
  "house-of-blues": {
    key: "house-of-blues",
    name: "House of Blues",
    address: "308 Euclid Ave, Cleveland, OH 44114",
    neighborhood: "Downtown",
  },
  agora: {
    key: "agora",
    name: "Agora Theatre",
    address: "5000 Euclid Ave, Cleveland, OH 44103",
    neighborhood: "Midtown",
  },
};

export default venues;
