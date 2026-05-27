-- Persistent service for Explorers of Legends.

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

if Class == nil or BaseService == nil or SCRIPT == nil then
  EOL.print("EOLService skipped outside PMDO service context")
  return {
    skipped = true
  }
end

local EOLService = Class('EOLService', BaseService)

function EOLService:initialize()
  BaseService.initialize(self)
  EOL.print("EOLService initialized")
end

function EOLService:OnInit()
  State.root()
  EOL.print("Service ready")
end

function EOLService:OnNewGame()
  local root = State.reset_for_new_game()
  root.story.flags.new_game_started = true
  State.push_timeline("new_game", "A quiet life in Lowstep begins to shift.")
  EOL.print("New game state prepared")
end

function EOLService:OnLoadSavedData()
  State.root()
  EOL.print("Save state checked")
end

function EOLService:Subscribe(med)
  med:Subscribe("EOLService", EngineServiceEvents.Init, function() self.OnInit(self) end)
  med:Subscribe("EOLService", EngineServiceEvents.NewGame, function() self.OnNewGame(self) end)
  med:Subscribe("EOLService", EngineServiceEvents.LoadSavedData, function() self.OnLoadSavedData(self) end)
end

function EOLService:UnSubscribe(med)
end

SCRIPT:AddService("EOLService", EOLService:new())

return EOLService
