-- Starter and partner roster for the vertical slice.

local Roster = {}

Roster.PLAYER_RESULTS = {
  steady = {
    label = "Steady",
    species = "bulbasaur",
    summary = "Quiet, practical, and used to ordinary days."
  },
  brave = {
    label = "Brave",
    species = "charmander",
    summary = "Acts before the doubt can settle."
  },
  gentle = {
    label = "Gentle",
    species = "chikorita",
    summary = "Not flashy, but hard to shake from doing right."
  },
  clever = {
    label = "Clever",
    species = "treecko",
    summary = "Observes first and moves only when the path is clear."
  },
  restless = {
    label = "Restless",
    species = "pikachu",
    summary = "Always looking toward the next ridge."
  },
  lonely = {
    label = "Lonely",
    species = "eevee",
    summary = "Keeps a small world, then slowly lets it grow."
  }
}

Roster.PARTNERS = {
  {
    id = "totodile",
    species = "totodile",
    name = "Totodile",
    drive = "big_legend_energy",
    note = "Loud confidence, good heart, terrible inside voice."
  },
  {
    id = "torchic",
    species = "torchic",
    name = "Torchic",
    drive = "prove_the_spark",
    note = "Bright, stubborn, and eager to turn every rescue into a story."
  },
  {
    id = "shinx",
    species = "shinx",
    name = "Shinx",
    drive = "storm_chaser",
    note = "Fast to act and very sure that hesitation is the enemy."
  },
  {
    id = "mudkip",
    species = "mudkip",
    name = "Mudkip",
    drive = "quiet_grit",
    note = "Soft-spoken until someone says something cannot be done."
  },
  {
    id = "vulpix",
    species = "vulpix",
    name = "Vulpix",
    drive = "polished_ambition",
    note = "Wants to be remembered and tries to look composed getting there."
  }
}

function Roster.find_partner(id)
  for _, partner in ipairs(Roster.PARTNERS) do
    if partner.id == id or partner.species == id then
      return partner
    end
  end
  return nil
end

return Roster
