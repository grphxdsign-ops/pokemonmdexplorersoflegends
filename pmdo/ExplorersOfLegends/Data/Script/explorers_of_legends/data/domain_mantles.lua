-- Canon Domain Mantles.

local Domains = {}

Domains.ORDER = {
  "time",
  "space",
  "sky",
  "seed",
  "land",
  "dream",
  "storm",
  "life",
  "death",
  "void",
  "nightmare",
  "sea",
  "sun",
  "moon",
  "frozen"
}

Domains.MANTLES = {
  time = {
    title = "Time",
    mantle = "Bronzong",
    role = "Keeps records of inheritance and domain succession."
  },
  space = {
    title = "Space",
    mantle = "Orbeetle",
    role = "Tracks crossings between far domains."
  },
  sky = {
    title = "Sky",
    mantle = "Corviknight",
    role = "Controls courier routes and high-altitude search paths."
  },
  seed = {
    title = "Seed",
    mantle = "Lilligant",
    role = "Protects growth, harvests, and recovery after disasters."
  },
  land = {
    title = "Land",
    mantle = "Torterra",
    role = "Settles border disputes and ancient trail claims."
  },
  dream = {
    title = "Dream",
    mantle = "Musharna",
    role = "Reads troubling dreams, often while half-asleep."
  },
  storm = {
    title = "Storm",
    mantle = "Luxray",
    role = "Defends the Lightning Cliffs and acts before others are ready."
  },
  life = {
    title = "Life",
    mantle = "Blissey",
    role = "Maintains healing houses and rescue aftercare."
  },
  death = {
    title = "Death",
    mantle = "Houndoom",
    role = "Publicly solemn, privately eager for collapse."
  },
  void = {
    title = "Void",
    mantle = "Dusknoir",
    role = "Feared by reputation and framed by another mantle."
  },
  nightmare = {
    title = "Nightmare",
    mantle = "Zoroark",
    role = "Manipulates fear, masks, and domain rumor."
  },
  sea = {
    title = "Sea",
    mantle = "Milotic",
    role = "Preserves shipping lanes, tides, and coastal oaths."
  },
  sun = {
    title = "Sun",
    mantle = "Arcanine",
    role = "The inspiring first hero figure, hiding a purging delusion."
  },
  moon = {
    title = "Moon",
    mantle = "Umbreon",
    role = "Guards night roads and quiet investigations."
  },
  frozen = {
    title = "Frozen",
    mantle = "Froslass",
    role = "Holds cold places still until danger passes."
  }
}

function Domains.get(id)
  return Domains.MANTLES[id]
end

return Domains
