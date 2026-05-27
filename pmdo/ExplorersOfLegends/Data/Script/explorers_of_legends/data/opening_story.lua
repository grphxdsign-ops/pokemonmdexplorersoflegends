-- Prologue and Chapter 1 story data.

local Story = {}

Story.PROLOGUE = {
  id = "prologue",
  title = "A Regular Morning",
  premise = "The protagonist comes from Lowstep, a plain town where nothing happens quickly. The partner is just as ordinary, but cannot stand the thought of staying that way.",
  beats = {
    {
      id = "lowstep_morning",
      label = "Lowstep Morning",
      lines = {
        { speaker = "", text = "The morning in Lowstep begins like every other morning: quiet roads, cold chores, and no reason to hurry." },
        { speaker = "Partner", text = "You ever think this place is trying to keep us small?" },
        { speaker = "Partner", text = "Legends do not start as legends. They start by leaving." }
      }
    },
    {
      id = "quiz_memory",
      label = "The Quiz",
      lines = {
        { speaker = "", text = "Before the road opens, a strange feeling asks what kind of heart is taking the first step." }
      }
    },
    {
      id = "first_step",
      label = "First Step Cave",
      lines = {
        { speaker = "Partner", text = "One rescue. One clean rescue. Then everyone has to admit we are more than Lowstep kids." }
      }
    },
    {
      id = "arcanine_rescue",
      label = "The Sun Mantle",
      lines = {
        { speaker = "Arcanine", text = "Hold fast. A rescuer does not need permission to be brave." },
        { speaker = "Partner", text = "That was... that was what a legend looks like." }
      }
    }
  }
}

Story.CHAPTER_01 = {
  id = "chapter_01",
  title = "First Sparks",
  mission = {
    id = "first_step_cave_rescue",
    dungeon = "first_step_cave",
    client = "Lowstep Watch",
    objective = "Find a missing courier badge and return before dusk.",
    floors = 4
  },
  beats = {
    {
      id = "accept_mission",
      label = "A Real Request",
      lines = {
        { speaker = "Partner", text = "A badge is not glamorous, but a real request is a real request." },
        { speaker = "Partner", text = "We do it right. No shortcuts." }
      }
    },
    {
      id = "void_shadow",
      label = "Wrong Tracks",
      lines = {
        { speaker = "", text = "A cold trail crosses the water near the cave mouth. Someone wants it noticed." },
        { speaker = "Partner", text = "Void marks. Of course. Why is it always them?" }
      }
    },
    {
      id = "reward",
      label = "First Renown",
      lines = {
        { speaker = "", text = "Lowstep's watch records the rescue. It is not a legend yet. It is a first line." }
      }
    }
  }
}

return Story
