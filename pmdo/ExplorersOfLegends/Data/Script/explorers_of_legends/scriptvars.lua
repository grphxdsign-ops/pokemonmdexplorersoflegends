-- Explorers of Legends script variable defaults.
--
-- This file is intentionally minimal until we confirm the exact PMDO Quest
-- startup hooks in dev mode.

local vars = {}

vars.story = {
  new_game_started = false,
  quiz_complete = false,
  partner_chosen = false,
  prologue_complete = false,
  chapter_1_started = false,
  chapter_1_complete = false,
  slice_complete = false
}

vars.team = {
  player_species = "",
  player_personality_result = "",
  partner_species = "",
  team_name = ""
}

vars.renown = {
  heroic = 0,
  explorer = 0,
  social = 0
}

vars.attribute_points = {
  team_unspent = 0,
  player = {
    hp = 0,
    attack = 0,
    defense = 0,
    special_attack = 0,
    special_defense = 0,
    speed = 0
  },
  partner = {
    hp = 0,
    attack = 0,
    defense = 0,
    special_attack = 0,
    special_defense = 0,
    speed = 0
  }
}

return vars
