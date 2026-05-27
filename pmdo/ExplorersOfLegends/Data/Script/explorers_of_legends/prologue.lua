-- Prologue flow.

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

local Prologue = {}

function Prologue.start()
  local root = State.root()
  root.story.current_act = "prologue"
  root.story.current_chapter = "prologue"
  State.flag("prologue_started", true)
  State.push_timeline("prologue_start", "The team leaves Lowstep for a first rescue.")
  EOL.play_lines(Story.PROLOGUE.beats[1].lines)
end

function Prologue.play_quiz_bridge()
  EOL.play_lines(Story.PROLOGUE.beats[2].lines)
end

function Prologue.play_first_step_intro()
  EOL.play_lines(Story.PROLOGUE.beats[3].lines)
  EOL.checkpoint("first_step_cave_entry")
end

function Prologue.play_arcanine_rescue()
  local root = State.root()
  if root.story.flags.arcanine_rescue_seen then
    return
  end

  EOL.play_lines(Story.PROLOGUE.beats[4].lines)
  State.flag("arcanine_rescue_seen", true)
  root.domains.introduced.sun = true
  Renown.apply_reward("arcanine_rescue_witnessed")
  State.push_timeline("arcanine_rescue", "Arcanine saves the new team and becomes their image of a legend.")
end

function Prologue.complete()
  local root = State.root()
  State.flag("prologue_complete", true)
  root.story.current_chapter = "chapter_01"
  State.push_timeline("prologue_complete", "The first rescue becomes Chapter 1.")
end

return Prologue
