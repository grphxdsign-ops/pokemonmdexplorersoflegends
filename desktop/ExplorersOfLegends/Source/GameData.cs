using System.Collections.Generic;
using System.Drawing;

namespace ExplorersOfLegends
{
    public static class GameData
    {
        public const string Title = "Pokemon Mystery Dungeon: Explorers of Legends";

        public static readonly List<QuizQuestion> Quiz = new List<QuizQuestion>
        {
            new QuizQuestion(
                "morning",
                "Lowstep wakes before sunrise. What do you do first?",
                new List<QuizAnswer>
                {
                    new QuizAnswer("Finish the same chores as yesterday.", Scores("steady", 2, "gentle", 1)),
                    new QuizAnswer("Climb the ridge before anyone notices.", Scores("restless", 2, "brave", 1)),
                    new QuizAnswer("Listen for what the town needs.", Scores("gentle", 2, "lonely", 1))
                }),
            new QuizQuestion(
                "lostBadge",
                "Someone drops a rescue badge near the supply path.",
                new List<QuizAnswer>
                {
                    new QuizAnswer("Return it without making a scene.", Scores("steady", 2, "gentle", 1)),
                    new QuizAnswer("Study the tracks before touching it.", Scores("clever", 2, "steady", 1)),
                    new QuizAnswer("Make it an official first mission.", Scores("brave", 2, "restless", 1))
                }),
            new QuizQuestion(
                "shortcut",
                "A rival team finds a shortcut that feels wrong.",
                new List<QuizAnswer>
                {
                    new QuizAnswer("Refuse it even if you fall behind.", Scores("gentle", 2, "steady", 1)),
                    new QuizAnswer("Look for the catch.", Scores("clever", 2, "lonely", 1)),
                    new QuizAnswer("Race them the honest way.", Scores("brave", 2, "restless", 1))
                })
        };

        public static readonly Dictionary<string, PokemonOption> Starters = new Dictionary<string, PokemonOption>
        {
            { "steady", Pokemon("steady", "Bulbasaur", "#5dbb6b", "#245f39", "quiet, practical, and hard to rattle", "") },
            { "brave", Pokemon("brave", "Charmander", "#f28a38", "#a33a18", "bold before fear gets a vote", "") },
            { "gentle", Pokemon("gentle", "Chikorita", "#89c95d", "#377044", "soft-spoken, patient, and stubbornly kind", "") },
            { "clever", Pokemon("clever", "Treecko", "#49ad6d", "#1f6d50", "observant and calm under pressure", "") },
            { "restless", Pokemon("restless", "Pikachu", "#f7cf3d", "#7d5a16", "quick to move and quicker to care", "") },
            { "lonely", Pokemon("lonely", "Eevee", "#b9854c", "#68401f", "used to small days, ready for a larger one", "") }
        };

        public static readonly List<PokemonOption> Partners = new List<PokemonOption>
        {
            Pokemon("eevee", "Eevee", "#b9854c", "#68401f", "", "earnest"),
            Pokemon("riolu", "Riolu", "#4b86d8", "#1d3566", "", "fearless"),
            Pokemon("shinx", "Shinx", "#5aa6e8", "#183b72", "", "electric"),
            Pokemon("vulpix", "Vulpix", "#d9793a", "#6c2f14", "", "polished"),
            Pokemon("ralts", "Ralts", "#bdecc9", "#2e8d7a", "", "dreamy"),
            Pokemon("sprigatito", "Sprigatito", "#7ad86f", "#2a7352", "", "proud")
        };

        public static readonly List<DomainInfo> Domains = new List<DomainInfo>
        {
            new DomainInfo("sun", "Arcanine", "the first hero the team meets"),
            new DomainInfo("void", "Dusknoir", "feared, blamed, and trying to clear his name"),
            new DomainInfo("storm", "Luxray", "reckless guardian of the Lightning Cliffs"),
            new DomainInfo("dream", "Musharna", "sleepy keeper of dream warnings")
        };

        public static readonly List<DialogueLine> PrologueLines = new List<DialogueLine>
        {
            new DialogueLine("", "Lowstep is the kind of town where every day starts with crates, dust, and the same three errands."),
            new DialogueLine("Partner", "You ever feel like this place is trying to keep us ordinary?"),
            new DialogueLine("Partner", "Legends do not start as legends. They start by leaving."),
            new DialogueLine("", "The request board creaks in the morning wind. One small mission waits there.")
        };

        public static readonly List<DialogueLine> MissionLines = new List<DialogueLine>
        {
            new DialogueLine("Partner", "A missing courier badge. Not exactly legendary, but it is a real request."),
            new DialogueLine("Partner", "We do this clean. No shortcuts. No stealing credit. That is how our story starts.")
        };

        public static readonly List<DialogueLine> ArcanineLines = new List<DialogueLine>
        {
            new DialogueLine("", "The cave trembles. Stones crack loose from above."),
            new DialogueLine("Arcanine", "Hold fast. A rescuer does not need permission to be brave."),
            new DialogueLine("Partner", "That was... that was what a legend looks like."),
            new DialogueLine("", "Your first rescue is recorded. It is not a legend yet. It is a first line.")
        };

        public static readonly List<ApStat> ApStats = new List<ApStat>
        {
            new ApStat("hp", "HP", "More room for mistakes."),
            new ApStat("attack", "Attack", "Physical moves hit harder."),
            new ApStat("defense", "Defense", "Physical hits hurt less."),
            new ApStat("specialAttack", "Sp. Atk", "Special moves hit harder."),
            new ApStat("specialDefense", "Sp. Def", "Special hits hurt less."),
            new ApStat("speed", "Speed", "Accuracy and evasion. Not turn order.")
        };

        public static PokemonOption FindPartner(string id)
        {
            for (int i = 0; i < Partners.Count; i += 1)
            {
                if (Partners[i].Id == id) return Partners[i].Clone();
            }
            return null;
        }

        private static Dictionary<string, int> Scores(string firstKey, int firstValue, string secondKey, int secondValue)
        {
            Dictionary<string, int> scores = new Dictionary<string, int>();
            scores[firstKey] = firstValue;
            scores[secondKey] = secondValue;
            return scores;
        }

        private static PokemonOption Pokemon(string id, string species, string color, string accent, string note, string style)
        {
            return new PokemonOption
            {
                Id = id,
                Species = species,
                Color = ColorTranslator.FromHtml(color),
                Accent = ColorTranslator.FromHtml(accent),
                Note = note,
                Style = style
            };
        }
    }
}
