using System;
using System.Collections.Generic;

namespace ExplorersOfLegends
{
    public sealed class GameState
    {
        public SceneKind Scene;
        public SceneKind DialogueBackdrop;
        public DateTime LoadingStarted;
        public float LoadingProgress;
        public float Clock;

        public int QuizIndex;
        public Dictionary<string, int> QuizScores;
        public PokemonOption Player;
        public PokemonOption Partner;
        public string PlayerPersonality;
        public string TeamName;

        public Renown Renown;
        public int UnspentAp;
        public ApSpread PlayerAp;
        public ApSpread PartnerAp;
        public StoryFlags Flags;
        public PartyState Party;
        public DungeonFloor Dungeon;

        public List<DialogueLine> Dialogue;
        public int DialogueIndex;
        public string LastMessage;

        public GameState()
        {
            QuizScores = new Dictionary<string, int>();
            Dialogue = new List<DialogueLine>();
            TeamName = "Lowstep";
            Renown = new Renown();
            PlayerAp = new ApSpread();
            PartnerAp = new ApSpread();
            Flags = new StoryFlags();
            Party = new PartyState();
            LastMessage = "Arrow keys or WASD to move. Space or Enter to interact.";
            Scene = SceneKind.Loading;
            DialogueBackdrop = SceneKind.Title;
            LoadingStarted = DateTime.Now;
        }

        public void ResetForNewGame()
        {
            InitializeQuizScores();
            QuizIndex = 0;
            Player = null;
            Partner = null;
            PlayerPersonality = "";
            TeamName = "Lowstep";
            Renown = new Renown();
            UnspentAp = 0;
            PlayerAp = new ApSpread();
            PartnerAp = new ApSpread();
            Flags = new StoryFlags();
            Party = new PartyState();
            Dungeon = null;
            Dialogue.Clear();
            DialogueIndex = 0;
            LastMessage = "Answer the quiz to discover your protagonist.";
            Scene = SceneKind.Quiz;
        }

        public void InitializeQuizScores()
        {
            QuizScores.Clear();
            QuizScores["steady"] = 0;
            QuizScores["brave"] = 0;
            QuizScores["gentle"] = 0;
            QuizScores["clever"] = 0;
            QuizScores["restless"] = 0;
            QuizScores["lonely"] = 0;
        }

        public void ResetPartyForHub()
        {
            Party.X = 5;
            Party.Y = 7;
            Party.PartnerX = 4;
            Party.PartnerY = 7;
            Party.Hp = Party.MaxHp;
        }
    }
}
