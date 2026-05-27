using System;
using System.Collections.Generic;
using System.Drawing;

namespace ExplorersOfLegends
{
    public enum SceneKind
    {
        Loading,
        Title,
        Quiz,
        PartnerSelect,
        Dialogue,
        Hub,
        Dungeon,
        Reward
    }

    public enum TileKind
    {
        Wall,
        Floor
    }

    public sealed class QuizQuestion
    {
        public readonly string Id;
        public readonly string Prompt;
        public readonly List<QuizAnswer> Answers;

        public QuizQuestion(string id, string prompt, List<QuizAnswer> answers)
        {
            Id = id;
            Prompt = prompt;
            Answers = answers;
        }
    }

    public sealed class QuizAnswer
    {
        public readonly string Text;
        public readonly Dictionary<string, int> Scores;

        public QuizAnswer(string text, Dictionary<string, int> scores)
        {
            Text = text;
            Scores = scores;
        }
    }

    public sealed class PokemonOption
    {
        public string Id;
        public string Species;
        public Color Color;
        public Color Accent;
        public string Note;
        public string Style;

        public PokemonOption Clone()
        {
            return (PokemonOption)MemberwiseClone();
        }
    }

    public sealed class DialogueLine
    {
        public readonly string Speaker;
        public readonly string Text;

        public DialogueLine(string speaker, string text)
        {
            Speaker = speaker;
            Text = text;
        }
    }

    public sealed class ApStat
    {
        public readonly string Id;
        public readonly string Label;
        public readonly string Note;

        public ApStat(string id, string label, string note)
        {
            Id = id;
            Label = label;
            Note = note;
        }
    }

    public sealed class DomainInfo
    {
        public readonly string Id;
        public readonly string Mantle;
        public readonly string PublicRole;

        public DomainInfo(string id, string mantle, string publicRole)
        {
            Id = id;
            Mantle = mantle;
            PublicRole = publicRole;
        }
    }

    public sealed class Renown
    {
        public int Heroic;
        public int Explorer;
        public int Social;

        public Renown Clone()
        {
            return new Renown { Heroic = Heroic, Explorer = Explorer, Social = Social };
        }
    }

    public sealed class ApSpread
    {
        public int Hp;
        public int Attack;
        public int Defense;
        public int SpecialAttack;
        public int SpecialDefense;
        public int Speed;

        public void Increment(string statId)
        {
            if (statId == "hp") Hp += 1;
            else if (statId == "attack") Attack += 1;
            else if (statId == "defense") Defense += 1;
            else if (statId == "specialAttack") SpecialAttack += 1;
            else if (statId == "specialDefense") SpecialDefense += 1;
            else if (statId == "speed") Speed += 1;
        }

        public int Get(string statId)
        {
            if (statId == "hp") return Hp;
            if (statId == "attack") return Attack;
            if (statId == "defense") return Defense;
            if (statId == "specialAttack") return SpecialAttack;
            if (statId == "specialDefense") return SpecialDefense;
            if (statId == "speed") return Speed;
            return 0;
        }

        public ApSpread Clone()
        {
            return new ApSpread
            {
                Hp = Hp,
                Attack = Attack,
                Defense = Defense,
                SpecialAttack = SpecialAttack,
                SpecialDefense = SpecialDefense,
                Speed = Speed
            };
        }
    }

    public sealed class StoryFlags
    {
        public bool QuizComplete;
        public bool PartnerChosen;
        public bool MissionAccepted;
        public bool PrologueComplete;
        public bool ChapterOneComplete;
        public bool SliceComplete;

        public StoryFlags Clone()
        {
            return new StoryFlags
            {
                QuizComplete = QuizComplete,
                PartnerChosen = PartnerChosen,
                MissionAccepted = MissionAccepted,
                PrologueComplete = PrologueComplete,
                ChapterOneComplete = ChapterOneComplete,
                SliceComplete = SliceComplete
            };
        }
    }

    public sealed class PartyState
    {
        public int Hp = 24;
        public int MaxHp = 24;
        public int X = 5;
        public int Y = 7;
        public int PartnerX = 4;
        public int PartnerY = 7;
    }

    public sealed class MapMarker
    {
        public int X;
        public int Y;
        public bool Found;

        public MapMarker(int x, int y)
        {
            X = x;
            Y = y;
        }
    }

    public sealed class Enemy
    {
        public string Species;
        public int X;
        public int Y;
        public int Hp;
        public Color Color;

        public Enemy(string species, int x, int y, int hp, Color color)
        {
            Species = species;
            X = x;
            Y = y;
            Hp = hp;
            Color = color;
        }
    }

    public sealed class DungeonFloor
    {
        public int Floor;
        public int Width;
        public int Height;
        public TileKind[,] Tiles;
        public int PlayerX;
        public int PlayerY;
        public int PartnerX;
        public int PartnerY;
        public MapMarker Stairs;
        public MapMarker Badge;
        public MapMarker Apple;
        public List<Enemy> Enemies;

        public bool IsFloor(int x, int y)
        {
            if (x < 0 || y < 0 || x >= Width || y >= Height) return false;
            return Tiles[x, y] == TileKind.Floor;
        }

        public Enemy EnemyAt(int x, int y)
        {
            for (int i = 0; i < Enemies.Count; i += 1)
            {
                if (Enemies[i].X == x && Enemies[i].Y == y) return Enemies[i];
            }
            return null;
        }

        public static DungeonFloor Create(int floor)
        {
            DungeonFloor dungeon = new DungeonFloor();
            dungeon.Floor = floor;
            dungeon.Width = 13;
            dungeon.Height = 9;
            dungeon.Tiles = new TileKind[dungeon.Width, dungeon.Height];
            dungeon.PlayerX = 1;
            dungeon.PlayerY = 1;
            dungeon.PartnerX = 1;
            dungeon.PartnerY = 2;
            dungeon.Stairs = new MapMarker(11, 7);
            dungeon.Badge = floor == 4 ? new MapMarker(8, 2) : null;
            dungeon.Apple = floor == 2 ? new MapMarker(9, 2) : null;
            dungeon.Enemies = new List<Enemy>();

            for (int y = 0; y < dungeon.Height; y += 1)
            {
                for (int x = 0; x < dungeon.Width; x += 1)
                {
                    bool edge = x == 0 || y == 0 || x == dungeon.Width - 1 || y == dungeon.Height - 1;
                    bool pillar = (x == 5 && y > 1 && y < 7 && floor % 2 == 0) ||
                                  (y == 4 && x > 2 && x < 10 && floor % 2 == 1);
                    dungeon.Tiles[x, y] = edge || pillar ? TileKind.Wall : TileKind.Floor;
                }
            }

            dungeon.Tiles[5, 4] = TileKind.Floor;
            dungeon.Tiles[6, 4] = TileKind.Floor;
            dungeon.Tiles[7, 4] = TileKind.Floor;

            Color firstColor = floor % 2 == 0 ? ColorTranslator.FromHtml("#a98a78") : ColorTranslator.FromHtml("#d2a35c");
            Color secondColor = floor > 2 ? ColorTranslator.FromHtml("#6372be") : ColorTranslator.FromHtml("#c9955b");
            dungeon.Enemies.Add(new Enemy(floor % 2 == 0 ? "Rattata" : "Pidgey", 8, 6, 2, firstColor));
            dungeon.Enemies.Add(new Enemy(floor > 2 ? "Zubat" : "Sentret", 3, 6, 2, secondColor));

            return dungeon;
        }
    }

    public sealed class MenuButton
    {
        public RectangleF Bounds;
        public string Label;
        public string Command;
        public bool Primary;

        public MenuButton(RectangleF bounds, string label, string command, bool primary)
        {
            Bounds = bounds;
            Label = label;
            Command = command;
            Primary = primary;
        }
    }
}
