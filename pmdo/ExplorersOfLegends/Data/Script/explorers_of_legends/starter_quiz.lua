-- PMD-style starter quiz data and scoring.

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

local Quiz = {}

Quiz.QUESTIONS = {
  {
    id = "morning",
    prompt = "Lowstep wakes before sunrise. What do you do first?",
    answers = {
      { id = "chores", text = "Finish the same chores as yesterday.", scores = { steady = 2, gentle = 1 } },
      { id = "ridge", text = "Climb the ridge before anyone notices.", scores = { restless = 2, brave = 1 } },
      { id = "listen", text = "Listen for what the town needs.", scores = { gentle = 2, lonely = 1 } }
    }
  },
  {
    id = "lost_badge",
    prompt = "Someone loses a rescue badge in the grass.",
    answers = {
      { id = "return", text = "Return it without making a scene.", scores = { steady = 2, gentle = 1 } },
      { id = "track", text = "Work out the path they took.", scores = { clever = 2, steady = 1 } },
      { id = "announce", text = "Call everyone over and make it a mission.", scores = { brave = 2, restless = 1 } }
    }
  },
  {
    id = "partner_claim",
    prompt = "Your partner says the two of you can become legends.",
    answers = {
      { id = "doubt", text = "Doubt it, but follow anyway.", scores = { lonely = 2, steady = 1 } },
      { id = "believe", text = "Believe it for both of you.", scores = { brave = 2, gentle = 1 } },
      { id = "ask_how", text = "Ask what the first step is.", scores = { clever = 2, restless = 1 } }
    }
  },
  {
    id = "shortcut",
    prompt = "A rival team finds a shortcut that feels wrong.",
    answers = {
      { id = "refuse", text = "Refuse it even if you fall behind.", scores = { gentle = 2, steady = 1 } },
      { id = "study", text = "Study it and look for the catch.", scores = { clever = 2, lonely = 1 } },
      { id = "race", text = "Beat them without using it.", scores = { brave = 2, restless = 1 } }
    }
  }
}

local function blank_scores()
  return {
    steady = 0,
    brave = 0,
    gentle = 0,
    clever = 0,
    restless = 0,
    lonely = 0
  }
end

function Quiz.score_answers(answer_ids)
  local scores = blank_scores()
  local chosen = {}

  for _, question in ipairs(Quiz.QUESTIONS) do
    local answer_id = answer_ids[question.id]
    chosen[question.id] = answer_id
    for _, answer in ipairs(question.answers) do
      if answer.id == answer_id then
        for score_id, amount in pairs(answer.scores) do
          scores[score_id] = scores[score_id] + amount
        end
      end
    end
  end

  return scores, chosen
end

function Quiz.resolve(scores)
  local best_id = "steady"
  local best_score = -1
  for id, score in pairs(scores) do
    if score > best_score then
      best_id = id
      best_score = score
    end
  end
  return best_id, Roster.PLAYER_RESULTS[best_id]
end

function Quiz.complete(answer_ids)
  local scores, chosen = Quiz.score_answers(answer_ids or {})
  local result_id, result = Quiz.resolve(scores)
  local root = State.root()
  root.quiz.answers = chosen
  State.set_quiz_result(result_id, scores)
  State.set_team_member("player", result.species)
  State.push_timeline("quiz_" .. result_id, "The heart settles into a " .. result.label .. " shape.")
  return result_id, result
end

function Quiz.debug_complete(result_id)
  local result = Roster.PLAYER_RESULTS[result_id or "steady"] or Roster.PLAYER_RESULTS.steady
  State.set_quiz_result(result_id or "steady", blank_scores())
  State.set_team_member("player", result.species)
  return result
end

return Quiz
