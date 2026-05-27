-- Persistent state helpers for Explorers of Legends.

local State = {}

State.VERSION = 1

State.DEFAULT = {
  version = State.VERSION,
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

local function copy_value(value)
  if type(value) ~= "table" then
    return value
  end

  local result = {}
  for key, child in pairs(value) do
    result[key] = copy_value(child)
  end
  return result
end

local function merge_defaults(target, defaults)
  for key, default_value in pairs(defaults) do
    if type(default_value) == "table" then
      if type(target[key]) ~= "table" then
        target[key] = copy_value(default_value)
      else
        merge_defaults(target[key], default_value)
      end
    elseif target[key] == nil then
      target[key] = default_value
    end
  end
  return target
end

function State.root()
  SV = SV or {}
  if type(SV.explorers_of_legends) ~= "table" then
    SV.explorers_of_legends = copy_value(State.DEFAULT)
  else
    merge_defaults(SV.explorers_of_legends, State.DEFAULT)
    SV.explorers_of_legends.version = State.VERSION
  end
  return SV.explorers_of_legends
end

function State.reset_for_new_game()
  SV = SV or {}
  SV.explorers_of_legends = copy_value(State.DEFAULT)
  return SV.explorers_of_legends
end

function State.flag(name, value)
  local root = State.root()
  if value == nil then
    return root.story.flags[name] == true
  end
  root.story.flags[name] = value == true
  return root.story.flags[name]
end

function State.push_timeline(id, label)
  local root = State.root()
  table.insert(root.story.timeline, {
    id = id,
    label = label
  })
end

function State.set_team_member(role, species)
  local root = State.root()
  if role == "player" then
    root.team.player_species = species or ""
  elseif role == "partner" then
    root.team.partner_species = species or ""
  end
end

function State.set_quiz_result(result_id, scores)
  local root = State.root()
  root.quiz.result = result_id or ""
  root.team.player_personality_result = result_id or ""
  root.story.flags.quiz_complete = result_id ~= nil and result_id ~= ""
  if type(scores) == "table" then
    root.quiz.scores = scores
  end
end

function State.mark_partner_chosen(species)
  local root = State.root()
  root.team.partner_species = species or root.team.partner_species
  root.story.flags.partner_chosen = root.team.partner_species ~= ""
end

function State.add_void_suspicion(amount, reason)
  local root = State.root()
  root.domains.void_suspicion = root.domains.void_suspicion + (amount or 0)
  if reason ~= nil and reason ~= "" then
    table.insert(root.domains.corruptions_seen, reason)
  end
  return root.domains.void_suspicion
end

function State.set_checkpoint(id)
  local root = State.root()
  root.debug.last_checkpoint = id or ""
end

return State
