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

require 'explorers_of_legends.include'

local Chapter01 = require 'explorers_of_legends.chapter_01'
local Prologue = require 'explorers_of_legends.prologue'

local first_step_cave = {}

function first_step_cave.Init(zone)
  EOL.safe_debug_coro()
  EOL.print("Init first_step_cave")
end

function first_step_cave.Rescued(zone, name, mail)
  if COMMON ~= nil and COMMON.Rescued ~= nil then
    COMMON.Rescued(zone, name, mail)
  end
end

function first_step_cave.EnterSegment(zone, rescuing, segmentID, mapID)
  if rescuing ~= true and COMMON ~= nil and COMMON.BeginDungeon ~= nil then
    COMMON.BeginDungeon(zone.ID, segmentID, mapID)
  end
end

function first_step_cave.ExitSegment(zone, result, rescue, segmentID, mapID)
  EOL.safe_debug_coro()
  EOL.print("Exit first_step_cave result " .. tostring(result) .. " segment " .. tostring(segmentID))

  local handled = false
  if COMMON ~= nil and COMMON.ExitDungeonMissionCheck ~= nil then
    handled = COMMON.ExitDungeonMissionCheck(result, rescue, zone.ID, segmentID)
  end

  if handled == true then
    return
  end

  if RogueEssence ~= nil and result == RogueEssence.Data.GameProgress.ResultType.Cleared then
    Chapter01.complete_first_dungeon()
    Chapter01.mark_void_clue()
    Prologue.play_arcanine_rescue()
    Prologue.complete()
    Chapter01.claim_reward()
    EOL.enter_ground("legendrise_camp", 0, 0)
  elseif COMMON ~= nil and COMMON.EndDungeonDay ~= nil then
    COMMON.EndDungeonDay(result, SV.checkpoint.Zone, SV.checkpoint.Segment, SV.checkpoint.Map, SV.checkpoint.Entry)
  end
end

return first_step_cave
