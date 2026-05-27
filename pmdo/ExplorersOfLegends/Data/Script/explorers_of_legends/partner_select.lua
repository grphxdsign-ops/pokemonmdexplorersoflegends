-- Partner selection after the quiz.

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
local Roster = require 'explorers_of_legends.data.starter_roster'

local PartnerSelect = {}

function PartnerSelect.available()
  return Roster.PARTNERS
end

function PartnerSelect.choose(id)
  local partner = Roster.find_partner(id)
  if partner == nil then
    return false, "unknown_partner"
  end

  local root = State.root()
  if not root.story.flags.quiz_complete then
    return false, "quiz_required"
  end

  root.team.partner_drive = partner.drive
  State.mark_partner_chosen(partner.species)
  State.push_timeline("partner_" .. partner.id, partner.name .. " joins with an ambition bigger than Lowstep.")
  return true, partner
end

function PartnerSelect.debug_choose(id)
  local partner = Roster.find_partner(id or "totodile") or Roster.PARTNERS[1]
  local root = State.root()
  root.story.flags.quiz_complete = true
  root.team.partner_drive = partner.drive
  State.mark_partner_chosen(partner.species)
  return partner
end

return PartnerSelect
