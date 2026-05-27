-- Chapter 1 flow: prologue playable slice.

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
local EOL = require 'explorers_of_legends.common'
local Story = require 'explorers_of_legends.data.opening_story'
local Renown = require 'explorers_of_legends.mechanics.renown'

local Chapter01 = {}

function Chapter01.start()
  local root = State.root()
  root.story.current_act = "chapter_01"
  root.story.current_chapter = "chapter_01"
  root.chapter_01.accepted = true
  State.flag("chapter_1_started", true)
  State.push_timeline("chapter_01_start", "Lowstep gives the team a real request.")
  EOL.play_lines(Story.CHAPTER_01.beats[1].lines)
end

function Chapter01.mark_void_clue()
  State.add_void_suspicion(1, "Void-like traces found near First Step Cave water.")
  EOL.play_lines(Story.CHAPTER_01.beats[2].lines)
end

function Chapter01.complete_first_dungeon()
  local root = State.root()
  root.chapter_01.completed = true
  State.flag("first_dungeon_cleared", true)
  State.push_timeline("first_step_cave_clear", "First Step Cave is cleared without shortcuts.")
end

function Chapter01.claim_reward()
  local root = State.root()
  if root.chapter_01.reward_claimed then
    return false, "already_claimed"
  end

  local ok, reward = Renown.apply_reward("first_step_cave_rescue")
  if not ok then
    return false, reward
  end

  root.chapter_01.reward_claimed = true
  State.flag("chapter_1_complete", true)
  State.flag("slice_complete", true)
  State.push_timeline("chapter_01_complete", "The team earns its first renown and attribute points.")
  EOL.play_lines(Story.CHAPTER_01.beats[3].lines)
  return true, reward
end

return Chapter01
