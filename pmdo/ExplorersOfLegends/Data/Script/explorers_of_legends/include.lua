-- Common include point for map, zone, and event scripts.

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

require 'explorers_of_legends.common'
require 'explorers_of_legends.state'
require 'explorers_of_legends.mechanics.attribute_points'
require 'explorers_of_legends.mechanics.renown'
