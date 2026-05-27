-- Debug helpers for exercising the vertical slice before all maps exist.

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
local Quiz = require 'explorers_of_legends.starter_quiz'
local PartnerSelect = require 'explorers_of_legends.partner_select'
local Prologue = require 'explorers_of_legends.prologue'
local Chapter01 = require 'explorers_of_legends.chapter_01'
local Renown = require 'explorers_of_legends.mechanics.renown'
local AP = require 'explorers_of_legends.mechanics.attribute_points'

local Debug = {}

function Debug.seed_default_route()
  State.reset_for_new_game()
  Quiz.debug_complete("steady")
  PartnerSelect.debug_choose("totodile")
  Prologue.start()
  Prologue.play_arcanine_rescue()
  Prologue.complete()
  Chapter01.start()
  Chapter01.mark_void_clue()
  Chapter01.complete_first_dungeon()
  Chapter01.claim_reward()
  State.root().debug.last_route = "seed_default_route"
  return {
    state = State.root(),
    renown = Renown.snapshot(),
    player_ap = AP.summary("player"),
    partner_ap = AP.summary("partner")
  }
end

return Debug
