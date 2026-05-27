-- Attribute Point mechanics.

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

local AP = {}

AP.COST_PER_POINT = 1

AP.STAT_ORDER = {
  "hp",
  "attack",
  "defense",
  "special_attack",
  "special_defense",
  "speed"
}

AP.STATS = {
  hp = {
    label = "HP",
    effect = "Raises maximum HP."
  },
  attack = {
    label = "Attack",
    effect = "Raises physical move damage."
  },
  defense = {
    label = "Defense",
    effect = "Reduces physical damage taken."
  },
  special_attack = {
    label = "Special Attack",
    effect = "Raises special move damage."
  },
  special_defense = {
    label = "Special Defense",
    effect = "Reduces special damage taken."
  },
  speed = {
    label = "Speed",
    effect = "Raises accuracy and evasion. It does not change turn order."
  }
}

function AP.is_valid_stat(stat)
  return AP.STATS[stat] ~= nil
end

function AP.actor_pool(actor)
  local root = State.root()
  if actor ~= "player" and actor ~= "partner" then
    return nil
  end
  return root.attribute_points[actor]
end

function AP.unspent()
  return State.root().attribute_points.team_unspent
end

function AP.grant(points)
  local root = State.root()
  root.attribute_points.team_unspent = root.attribute_points.team_unspent + (points or 0)
  return root.attribute_points.team_unspent
end

function AP.can_spend(actor, stat, points)
  points = points or 1
  if not AP.is_valid_stat(stat) then
    return false, "unknown_stat"
  end
  if AP.actor_pool(actor) == nil then
    return false, "unknown_actor"
  end
  if points < 1 then
    return false, "invalid_amount"
  end
  if AP.unspent() < points * AP.COST_PER_POINT then
    return false, "not_enough_points"
  end
  return true, "ok"
end

function AP.spend(actor, stat, points)
  points = points or 1
  local ok, reason = AP.can_spend(actor, stat, points)
  if not ok then
    return false, reason
  end

  local root = State.root()
  root.attribute_points[actor][stat] = root.attribute_points[actor][stat] + points
  root.attribute_points.team_unspent = root.attribute_points.team_unspent - (points * AP.COST_PER_POINT)
  return true, "spent"
end

function AP.refund(actor, stat, points)
  points = points or 1
  local pool = AP.actor_pool(actor)
  if pool == nil then
    return false, "unknown_actor"
  end
  if not AP.is_valid_stat(stat) then
    return false, "unknown_stat"
  end
  if pool[stat] < points then
    return false, "not_enough_invested"
  end

  local root = State.root()
  pool[stat] = pool[stat] - points
  root.attribute_points.team_unspent = root.attribute_points.team_unspent + (points * AP.COST_PER_POINT)
  return true, "refunded"
end

function AP.summary(actor)
  local pool = AP.actor_pool(actor)
  if pool == nil then
    return {}
  end

  local rows = {}
  for _, stat in ipairs(AP.STAT_ORDER) do
    table.insert(rows, {
      id = stat,
      label = AP.STATS[stat].label,
      points = pool[stat],
      cost = AP.COST_PER_POINT,
      effect = AP.STATS[stat].effect
    })
  end
  return rows
end

return AP
