-- Shared helpers for Explorers of Legends scripts.

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

local EOL = {}

EOL.PACKAGE_ID = "explorers_of_legends"
EOL.DISPLAY_NAME = "Explorers of Legends"

function EOL.state()
  return State.root()
end

function EOL.print(message)
  if PrintInfo ~= nil then
    PrintInfo("[EOL] " .. tostring(message))
  else
    print("[EOL] " .. tostring(message))
  end
end

function EOL.safe_debug_coro()
  if DEBUG ~= nil and DEBUG.EnableDbgCoro ~= nil then
    DEBUG.EnableDbgCoro()
  end
end

function EOL.fade_in(frames)
  if GAME ~= nil and GAME.FadeIn ~= nil then
    GAME:FadeIn(frames or 20)
  end
end

function EOL.fade_out(frames)
  if GAME ~= nil and GAME.FadeOut ~= nil then
    GAME:FadeOut(false, frames or 20)
  end
end

function EOL.say(speaker, text)
  local shown_text = text
  if speaker ~= nil and speaker ~= "" then
    shown_text = speaker .. ": " .. text
  end

  if UI ~= nil and UI.WaitShowDialogue ~= nil then
    if UI.ResetSpeaker ~= nil then
      UI:ResetSpeaker(false)
    end
    UI:WaitShowDialogue(shown_text)
  else
    EOL.print(shown_text)
  end
end

function EOL.play_lines(lines)
  if type(lines) ~= "table" then
    return
  end

  for _, line in ipairs(lines) do
    EOL.say(line.speaker, line.text)
  end
end

function EOL.unlock_dungeon(zone_id)
  if GAME ~= nil and GAME.UnlockDungeon ~= nil then
    GAME:UnlockDungeon(zone_id)
  else
    EOL.print("Dungeon unlock queued: " .. tostring(zone_id))
  end
end

function EOL.enter_dungeon(zone_id, segment_id, map_id, entry_id)
  if GAME ~= nil and GAME.EnterDungeon ~= nil and RogueEssence ~= nil then
    GAME:EnterDungeon(zone_id, segment_id or 0, map_id or 0, entry_id or 0, RogueEssence.Data.GameProgress.DungeonStakes.Progress, true, true)
  else
    EOL.print("Dungeon entry queued: " .. tostring(zone_id))
  end
end

function EOL.enter_ground(zone_id, ground_id, entry_id)
  if GAME ~= nil and GAME.EnterZone ~= nil then
    GAME:EnterZone(zone_id, -1, ground_id or 0, entry_id or 0)
  else
    EOL.print("Ground entry queued: " .. tostring(zone_id))
  end
end

function EOL.checkpoint(id)
  State.set_checkpoint(id)
  EOL.print("Checkpoint: " .. tostring(id))
end

_G.EOL = EOL

return EOL
