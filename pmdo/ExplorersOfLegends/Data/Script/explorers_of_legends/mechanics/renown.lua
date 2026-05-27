-- Renown rewards and reputation counters.

local function eol_add_package_path()
  local source = debug.getinfo(1, "S").source
  if type(source) == "string" and string.sub(source, 1, 1) == "@" then
    local file = string.sub(source, 2)
    local root = string.match(file, "^(.*[/\\])explorers_of_legends[/\\].-$")
    if root ~= nil then
      package.path = package.path .. ";" .. root .. "?.lua;" .. root .. "?/init.lua"
    end
  end
end
eol_add_package_path()

local State = require 'explorers_of_legends.state'
local AP = require 'explorers_of_legends.mechanics.attribute_points'

local Renown = {}

Renown.TRACKS = {
  heroic = "Heroic",
  explorer = "Explorer",
  social = "Social"
}

Renown.REWARDS = {
  first_step_cave_rescue = {
    id = "first_step_cave_rescue",
    renown = {
      heroic = 1,
      explorer = 2,
      social = 1
    },
    attribute_points = 3,
    note = "First public rescue completed cleanly."
  },
  arcanine_rescue_witnessed = {
    id = "arcanine_rescue_witnessed",
    renown = {
      heroic = 1,
      explorer = 0,
      social = 0
    },
    attribute_points = 0,
    note = "Inspired by the Sun Mantle's rescue."
  }
}

function Renown.add(track, amount)
  local root = State.root()
  if Renown.TRACKS[track] == nil then
    return false, "unknown_track"
  end
  root.renown[track] = root.renown[track] + (amount or 0)
  return true, root.renown[track]
end

function Renown.apply_reward(id)
  local reward = Renown.REWARDS[id]
  if reward == nil then
    return false, "unknown_reward"
  end

  local root = State.root()
  for track, amount in pairs(reward.renown) do
    Renown.add(track, amount)
  end
  AP.grant(reward.attribute_points)
  root.renown.last_reward = id
  return true, reward
end

function Renown.snapshot()
  local root = State.root()
  return {
    heroic = root.renown.heroic,
    explorer = root.renown.explorer,
    social = root.renown.social,
    unspent_attribute_points = root.attribute_points.team_unspent
  }
end

return Renown
