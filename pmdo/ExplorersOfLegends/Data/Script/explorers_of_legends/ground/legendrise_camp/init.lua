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

local Prologue = require 'explorers_of_legends.prologue'
local Chapter01 = require 'explorers_of_legends.chapter_01'

local legendrise_camp = {}

function legendrise_camp.Init(map)
  EOL.safe_debug_coro()
  EOL.print("Init legendrise_camp")
  if GROUND ~= nil and GROUND.RefreshPlayer ~= nil then
    GROUND:RefreshPlayer()
  end
end

function legendrise_camp.Enter(map)
  EOL.safe_debug_coro()
  EOL.fade_in(20)
  local root = EOL.state()
  if not root.story.flags.prologue_started then
    Prologue.start()
  end
end

function legendrise_camp.Update(map, time)
end

function legendrise_camp.First_Dungeon_Entrance_Touch(obj, activator)
  EOL.safe_debug_coro()
  Prologue.play_first_step_intro()
  EOL.fade_out(20)
  EOL.enter_dungeon("first_step_cave", 0, 0, 0)
end

function legendrise_camp.Request_Board_Action(obj, activator)
  EOL.safe_debug_coro()
  Chapter01.start()
end

function legendrise_camp.Arcanine_Rescue_Debug(obj, activator)
  EOL.safe_debug_coro()
  Prologue.play_arcanine_rescue()
end

return legendrise_camp
