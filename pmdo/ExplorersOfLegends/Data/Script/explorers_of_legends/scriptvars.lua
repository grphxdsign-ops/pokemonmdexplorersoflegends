-- Explorers of Legends script variable defaults.
--
-- PMDO initializes this once when a save is created. Runtime upgrades are
-- handled by explorers_of_legends.state so old saves can inherit new fields.

SV = SV or {}

SV.explorers_of_legends = {
  version = 1,

  story = {
    current_act = "new_game",
    current_chapter = "prologue",
    flags = {
      new_game_started = false,
      quiz_complete = false,
      partner_chosen = false,
      prologue_started = false,
      arcanine_rescue_seen = false,
      prologue_complete = false,
      chapter_1_started = false,
      first_dungeon_cleared = false,
      chapter_1_complete = false,
      slice_complete = false
    },
    timeline = {}
  },

  team = {
    player_species = "",
    player_personality_result = "",
    partner_species = "",
    partner_drive = "headstrong_hero",
    team_name = "",
    home_town = "Lowstep"
  },

  quiz = {
    answers = {},
    scores = {
      steady = 0,
      brave = 0,
      gentle = 0,
      clever = 0,
      restless = 0,
      lonely = 0
    },
    result = ""
  },

  renown = {
    heroic = 0,
    explorer = 0,
    social = 0,
    last_reward = ""
  },

  attribute_points = {
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
  },

  domains = {
    void_suspicion = 0,
    introduced = {
      sun = false,
      void = false,
      storm = false,
      dream = false
    },
    corruptions_seen = {}
  },

  chapter_01 = {
    mission_id = "first_step_cave_rescue",
    accepted = false,
    completed = false,
    reward_claimed = false
  },

  debug = {
    last_route = "",
    last_checkpoint = ""
  }
}

return SV.explorers_of_legends
