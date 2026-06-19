using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace ExplorersOfLegends
{
    public sealed class GameRenderer
    {
        private const int Tile = 48;
        private readonly SpriteAtlas atlas;

        public GameRenderer()
        {
            atlas = new SpriteAtlas();
        }

        public void Draw(Graphics g, GameState state, List<MenuButton> buttons, bool hasSave)
        {
            g.SmoothingMode = SmoothingMode.None;
            g.InterpolationMode = InterpolationMode.NearestNeighbor;
            g.PixelOffsetMode = PixelOffsetMode.Half;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

            if (state.Scene == SceneKind.Loading)
            {
                DrawTitleBackground(g, state.Clock);
                DrawWordmark(g, 480, 122, 1.0f);
                DrawLoading(g, state.LoadingProgress);
                return;
            }

            if (state.Scene == SceneKind.Dialogue)
            {
                DrawBackdrop(g, state);
                DrawDialogue(g, state);
                return;
            }

            if (state.Scene == SceneKind.Hub) DrawHub(g, state);
            else if (state.Scene == SceneKind.Dungeon) DrawDungeon(g, state);
            else DrawTitleBackground(g, state.Clock);

            if (state.Scene == SceneKind.Title)
            {
                DrawWordmark(g, 480, 105, 0.96f);
                DrawTitleMenu(g, buttons, hasSave);
            }
            else if (state.Scene == SceneKind.Quiz)
            {
                DrawQuiz(g, state, buttons);
            }
            else if (state.Scene == SceneKind.PartnerSelect)
            {
                DrawPartnerSelect(g, buttons);
            }
            else if (state.Scene == SceneKind.Reward)
            {
                DrawReward(g, state, buttons);
            }

            if (state.Scene == SceneKind.Hub || state.Scene == SceneKind.Dungeon)
            {
                DrawHud(g, state);
            }
        }

        private void DrawBackdrop(Graphics g, GameState state)
        {
            if (state.DialogueBackdrop == SceneKind.Hub) DrawHub(g, state);
            else if (state.DialogueBackdrop == SceneKind.Dungeon && state.Dungeon != null) DrawDungeon(g, state);
            else DrawTitleBackground(g, state.Clock);
        }

        private void DrawLoading(Graphics g, float progress)
        {
            RectangleF bar = new RectangleF(280, 524, 400, 18);
            FillRounded(g, new RectangleF(270, 512, 420, 44), 14, Color.FromArgb(180, 22, 61, 107), Color.FromArgb(230, 255, 248, 218));
            FillRounded(g, bar, 9, Color.FromArgb(110, 18, 49, 84), Color.Transparent);
            RectangleF fill = new RectangleF(bar.X, bar.Y, bar.Width * progress, bar.Height);
            FillRounded(g, fill, 9, Color.FromArgb(255, 255, 219, 66), Color.FromArgb(255, 52, 109, 60));

            using (Font font = new Font("Trebuchet MS", 13f, FontStyle.Bold))
            using (StringFormat format = CenterFormat())
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 255, 248, 218)))
            {
                g.DrawString("Loading adventure data", font, brush, new RectangleF(270, 548, 420, 26), format);
            }
        }

        private void DrawTitleMenu(Graphics g, List<MenuButton> buttons, bool hasSave)
        {
            RectangleF panel = new RectangleF(305, 404, 350, 178);
            FillRounded(g, panel, 12, Color.FromArgb(232, 255, 248, 218), Color.FromArgb(255, 35, 84, 58));

            using (Font font = new Font("Trebuchet MS", 12f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 31, 48, 68)))
            using (StringFormat format = CenterFormat())
            {
                g.DrawString("Desktop prologue slice", font, brush, new RectangleF(panel.X + 18, panel.Y + 18, panel.Width - 36, 26), format);
            }

            AddButton(g, buttons, new RectangleF(340, 452, 280, 34), "New Game", "new-game", true);
            AddButton(g, buttons, new RectangleF(340, 494, 280, 34), hasSave ? "Continue" : "Continue (No Save)", "continue", false);
            AddButton(g, buttons, new RectangleF(340, 536, 280, 34), "Reset Save", "reset-save", false);
        }

        private void DrawQuiz(Graphics g, GameState state, List<MenuButton> buttons)
        {
            RectangleF panel = new RectangleF(150, 338, 660, 240);
            FillRounded(g, panel, 12, Color.FromArgb(238, 255, 248, 218), Color.FromArgb(255, 32, 86, 69));

            using (Font title = new Font("Trebuchet MS", 20f, FontStyle.Bold))
            using (Font body = new Font("Trebuchet MS", 13f, FontStyle.Bold))
            using (Brush dark = new SolidBrush(Color.FromArgb(255, 30, 47, 66)))
            {
                g.DrawString("Personality Quiz", title, dark, new PointF(182, 360));
                if (!state.Flags.QuizComplete)
                {
                    QuizQuestion question = GameData.Quiz[state.QuizIndex];
                    g.DrawString(question.Prompt, body, dark, new RectangleF(182, 400, 596, 44));
                    for (int i = 0; i < question.Answers.Count; i += 1)
                    {
                        AddButton(g, buttons, new RectangleF(182, 452 + i * 38, 596, 31), question.Answers[i].Text, "quiz:" + i, false);
                    }
                }
                else
                {
                    string note = "The quiz suggests " + state.Player.Species + ": " + state.Player.Note + ".";
                    g.DrawString(note, body, dark, new RectangleF(182, 402, 596, 58));
                    DrawPokemonToken(g, 225, 498, state.Player, 26);
                    AddButton(g, buttons, new RectangleF(284, 480, 412, 44), "Begin as " + state.Player.Species, "choose-partner", true);
                }
            }
        }

        private void DrawPartnerSelect(Graphics g, List<MenuButton> buttons)
        {
            RectangleF panel = new RectangleF(124, 294, 712, 294);
            FillRounded(g, panel, 12, Color.FromArgb(240, 255, 248, 218), Color.FromArgb(255, 32, 86, 69));

            using (Font title = new Font("Trebuchet MS", 20f, FontStyle.Bold))
            using (Font body = new Font("Trebuchet MS", 12f, FontStyle.Bold))
            using (Brush dark = new SolidBrush(Color.FromArgb(255, 30, 47, 66)))
            {
                g.DrawString("Choose Your Partner", title, dark, new PointF(156, 316));
                g.DrawString("Your partner is ambitious and headstrong no matter which species you choose.", body, dark, new RectangleF(156, 354, 648, 32));
            }

            for (int i = 0; i < GameData.Partners.Count; i += 1)
            {
                PokemonOption partner = GameData.Partners[i];
                int col = i % 3;
                int row = i / 3;
                RectangleF card = new RectangleF(156 + col * 216, 400 + row * 72, 190, 54);
                AddButton(g, buttons, card, partner.Species + "  /  " + partner.Style, "partner:" + partner.Id, i == 0);
                DrawPokemonToken(g, card.X + 24, card.Y + 27, partner, 16);
            }
        }

        private void DrawReward(Graphics g, GameState state, List<MenuButton> buttons)
        {
            RectangleF panel = new RectangleF(118, 258, 724, 332);
            FillRounded(g, panel, 12, Color.FromArgb(242, 255, 248, 218), Color.FromArgb(255, 32, 86, 69));

            using (Font title = new Font("Trebuchet MS", 22f, FontStyle.Bold))
            using (Font body = new Font("Trebuchet MS", 12f, FontStyle.Bold))
            using (Brush dark = new SolidBrush(Color.FromArgb(255, 30, 47, 66)))
            {
                g.DrawString("Chapter 1 Complete", title, dark, new PointF(152, 282));
                g.DrawString("Heroic +1, Explorer +2, Social +1. Attribute Points +3.", body, dark, new RectangleF(152, 326, 650, 28));
                string renown = "Renown  H" + state.Renown.Heroic + "  E" + state.Renown.Explorer + "  S" + state.Renown.Social + "       Unspent AP " + state.UnspentAp;
                g.DrawString(renown, body, dark, new RectangleF(152, 354, 650, 28));
                g.DrawString("Spend AP. Costs are equal across all stats and all Pokemon. Speed affects accuracy and evasion.", body, dark, new RectangleF(152, 386, 650, 40));
            }

            for (int i = 0; i < GameData.ApStats.Count; i += 1)
            {
                ApStat stat = GameData.ApStats[i];
                int col = i % 2;
                int row = i / 2;
                RectangleF rect = new RectangleF(152 + col * 330, 438 + row * 42, 308, 34);
                string label = stat.Label + " +" + state.PlayerAp.Get(stat.Id) + "  " + stat.Note;
                AddButton(g, buttons, rect, label, "ap:" + stat.Id, false);
            }

            AddButton(g, buttons, new RectangleF(342, 560, 276, 34), "Return to Title", "title", true);
        }

        private void DrawDialogue(Graphics g, GameState state)
        {
            RectangleF panel = new RectangleF(72, 474, 816, 120);
            FillRounded(g, panel, 13, Color.FromArgb(238, 255, 248, 218), Color.FromArgb(255, 24, 65, 104));

            if (state.DialogueIndex < 0 || state.DialogueIndex >= state.Dialogue.Count) return;
            DialogueLine line = state.Dialogue[state.DialogueIndex];

            using (Font speakerFont = new Font("Trebuchet MS", 14f, FontStyle.Bold))
            using (Font bodyFont = new Font("Trebuchet MS", 16f, FontStyle.Bold))
            using (Font nextFont = new Font("Trebuchet MS", 11f, FontStyle.Bold))
            using (Brush dark = new SolidBrush(Color.FromArgb(255, 28, 42, 62)))
            using (Brush blue = new SolidBrush(Color.FromArgb(255, 29, 88, 145)))
            using (StringFormat near = NearFormat())
            {
                if (!string.IsNullOrEmpty(line.Speaker))
                {
                    g.DrawString(line.Speaker, speakerFont, blue, new RectangleF(104, 492, 220, 24), near);
                }
                g.DrawString(line.Text, bodyFont, dark, new RectangleF(104, 520, 738, 48), near);
                g.DrawString("Space / Enter", nextFont, blue, new RectangleF(720, 564, 132, 22), near);
            }
        }

        private void DrawHud(Graphics g, GameState state)
        {
            RectangleF hud = new RectangleF(20, 18, 920, 58);
            FillRounded(g, hud, 12, Color.FromArgb(220, 22, 45, 69), Color.FromArgb(190, 255, 248, 218));

            string player = state.Player == null ? "Player" : state.Player.Species;
            string partner = state.Partner == null ? "Partner" : state.Partner.Species;
            string status = player + " + " + partner + "     HP " + state.Party.Hp + "/" + state.Party.MaxHp +
                            "     Renown H" + state.Renown.Heroic + " E" + state.Renown.Explorer + " S" + state.Renown.Social +
                            "     AP " + state.UnspentAp;

            using (Font top = new Font("Trebuchet MS", 12f, FontStyle.Bold))
            using (Font bottom = new Font("Trebuchet MS", 11f, FontStyle.Bold))
            using (Brush light = new SolidBrush(Color.FromArgb(255, 255, 248, 218)))
            using (StringFormat near = NearFormat())
            {
                g.DrawString(status, top, light, new RectangleF(42, 27, 878, 20), near);
                g.DrawString(state.LastMessage, bottom, light, new RectangleF(42, 49, 878, 20), near);
            }
        }

        private void DrawHub(Graphics g, GameState state)
        {
            DrawHubBackground(g);
            DrawGroundGrid(g);
            DrawPath(g);
            DrawBuilding(g, 110, 118, "Request Board");
            DrawBuilding(g, 450, 215, "Lowstep");
            DrawSign(g, 10, 5);
            DrawCave(g, 720, 350);
            DrawPokemonToken(g, state.Party.PartnerX * Tile + 24, state.Party.PartnerY * Tile + 26, state.Partner, 18);
            DrawPokemonToken(g, state.Party.X * Tile + 24, state.Party.Y * Tile + 24, state.Player, 20);
        }

        private void DrawDungeon(Graphics g, GameState state)
        {
            g.Clear(Color.FromArgb(255, 28, 33, 49));
            DungeonFloor dungeon = state.Dungeon;
            if (dungeon == null) return;

            int offsetX = 160;
            int offsetY = 112;
            using (Brush mapShadow = new SolidBrush(Color.FromArgb(130, 0, 0, 0)))
            {
                g.FillRectangle(mapShadow, offsetX - 12, offsetY - 12, dungeon.Width * Tile + 24, dungeon.Height * Tile + 24);
            }
            for (int y = 0; y < dungeon.Height; y += 1)
            {
                for (int x = 0; x < dungeon.Width; x += 1)
                {
                    bool wall = dungeon.Tiles[x, y] == TileKind.Wall;
                    atlas.DrawTile(g, wall ? "cave_wall" : "cave_floor", offsetX + x * Tile, offsetY + y * Tile, Tile);
                }
            }

            DrawTileMarker(g, offsetX + dungeon.Stairs.X * Tile + 24, offsetY + dungeon.Stairs.Y * Tile + 24, Color.FromArgb(255, 86, 178, 255), "stairs");
            if (dungeon.Apple != null && !dungeon.Apple.Found) DrawTileMarker(g, offsetX + dungeon.Apple.X * Tile + 24, offsetY + dungeon.Apple.Y * Tile + 24, Color.FromArgb(255, 240, 79, 56), "apple");
            if (dungeon.Badge != null && !dungeon.Badge.Found) DrawTileMarker(g, offsetX + dungeon.Badge.X * Tile + 24, offsetY + dungeon.Badge.Y * Tile + 24, Color.FromArgb(255, 255, 216, 87), "badge");

            for (int i = 0; i < dungeon.Enemies.Count; i += 1)
            {
                Enemy enemy = dungeon.Enemies[i];
                PokemonOption wild = new PokemonOption { Id = enemy.Species.ToLowerInvariant(), Species = enemy.Species, Color = enemy.Color, Accent = Color.FromArgb(255, 52, 42, 61) };
                DrawPokemonToken(g, offsetX + enemy.X * Tile + 24, offsetY + enemy.Y * Tile + 24, wild, 17);
            }

            DrawPokemonToken(g, offsetX + dungeon.PartnerX * Tile + 24, offsetY + dungeon.PartnerY * Tile + 26, state.Partner, 18);
            DrawPokemonToken(g, offsetX + dungeon.PlayerX * Tile + 24, offsetY + dungeon.PlayerY * Tile + 24, state.Player, 20);

            using (Font font = new Font("Trebuchet MS", 22f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 255, 248, 223)))
            {
                g.DrawString("First Step Cave B" + dungeon.Floor + "F", font, brush, new PointF(160, 80));
            }
        }

        private void DrawTitleBackground(Graphics g, float clock)
        {
            using (LinearGradientBrush sky = new LinearGradientBrush(new Rectangle(0, 0, 960, 640), Color.FromArgb(255, 32, 116, 240), Color.FromArgb(255, 106, 168, 239), LinearGradientMode.Vertical))
            {
                g.FillRectangle(sky, 0, 0, 960, 640);
            }

            DrawCloud(g, 105, 275, 1.08f);
            DrawCloud(g, 760, 292, 1.28f);
            DrawCloud(g, 690, 180, .58f);
            DrawCloud(g, 520, 205, .5f);
            DrawSunburst(g, 478, 277, 54);
            DrawDistantCliff(g);
            DrawAncientArch(g, 482, 333, 1.12f);
            DrawTitleTrail(g);
            DrawPokemonToken(g, 244, 462, GameData.Starters["steady"], 22);
            DrawPokemonToken(g, 303, 464, GameData.Starters["brave"], 22);
            DrawPokemonToken(g, 360, 461, GameData.Starters["restless"], 21);
            DrawCloud(g, 382, 496, 1.45f);
            DrawCloud(g, 718, 512, 1.7f);
        }

        private void DrawWordmark(Graphics g, float centerX, float top, float scaleValue)
        {
            GraphicsState saved = g.Save();
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TranslateTransform(centerX, top);
            g.ScaleTransform(scaleValue, scaleValue);
            g.TranslateTransform(-centerX, -top);

            PointF[] greenBack =
            {
                new PointF(centerX - 255, top + 52),
                new PointF(centerX - 128, top - 16),
                new PointF(centerX - 92, top - 48),
                new PointF(centerX - 42, top - 8),
                new PointF(centerX + 22, top - 48),
                new PointF(centerX + 62, top - 9),
                new PointF(centerX + 190, top + 6),
                new PointF(centerX + 248, top + 58),
                new PointF(centerX + 126, top + 100),
                new PointF(centerX - 190, top + 104)
            };
            using (GraphicsPath back = new GraphicsPath())
            {
                back.AddPolygon(greenBack);
                using (Pen white = new Pen(Color.White, 16f))
                using (Pen blue = new Pen(Color.FromArgb(255, 43, 102, 174), 8f))
                using (Brush green = new SolidBrush(Color.FromArgb(255, 69, 149, 71)))
                {
                    g.DrawPath(white, back);
                    g.DrawPath(blue, back);
                    g.FillPath(green, back);
                }
            }

            using (StringFormat center = CenterFormat())
            using (LinearGradientBrush yellow = new LinearGradientBrush(new RectangleF(centerX - 260, top - 40, 520, 90), Color.FromArgb(255, 255, 235, 57), Color.FromArgb(255, 245, 154, 25), LinearGradientMode.Vertical))
            {
                DrawOutlinedText(g, "POKEMON", "Arial Black", FontStyle.Bold, 68f, new RectangleF(centerX - 270, top - 30, 540, 92), center, yellow, Color.White, 18f);
                DrawOutlinedText(g, "POKEMON", "Arial Black", FontStyle.Bold, 68f, new RectangleF(centerX - 270, top - 30, 540, 92), center, yellow, Color.FromArgb(255, 31, 79, 170), 10f);
            }

            PointF[] slash =
            {
                new PointF(centerX - 325, top + 138),
                new PointF(centerX - 168, top + 104),
                new PointF(centerX - 146, top + 78),
                new PointF(centerX - 92, top + 102),
                new PointF(centerX + 266, top + 88),
                new PointF(centerX + 332, top + 128),
                new PointF(centerX + 214, top + 176),
                new PointF(centerX - 252, top + 184)
            };
            using (GraphicsPath path = new GraphicsPath())
            {
                path.AddPolygon(slash);
                using (Pen white = new Pen(Color.White, 16f))
                using (Pen green = new Pen(Color.FromArgb(255, 42, 124, 76), 8f))
                using (Brush fill = new SolidBrush(Color.FromArgb(255, 255, 248, 218)))
                {
                    g.DrawPath(white, path);
                    g.DrawPath(green, path);
                    g.FillPath(fill, path);
                }
            }

            using (StringFormat center = CenterFormat())
            using (LinearGradientBrush orange = new LinearGradientBrush(new RectangleF(centerX - 340, top + 62, 680, 105), Color.FromArgb(255, 255, 197, 68), Color.FromArgb(255, 226, 92, 19), LinearGradientMode.Vertical))
            {
                DrawOutlinedText(g, "Mystery Dungeon", "Impact", FontStyle.Regular, 68f, new RectangleF(centerX - 345, top + 66, 690, 92), center, orange, Color.White, 16f);
                DrawOutlinedText(g, "Mystery Dungeon", "Impact", FontStyle.Regular, 68f, new RectangleF(centerX - 345, top + 66, 690, 92), center, orange, Color.FromArgb(255, 28, 105, 61), 10f);
                DrawOutlinedText(g, "Mystery Dungeon", "Impact", FontStyle.Regular, 68f, new RectangleF(centerX - 345, top + 66, 690, 92), center, orange, Color.FromArgb(255, 30, 31, 30), 5f);
            }

            using (StringFormat center = CenterFormat())
            using (LinearGradientBrush legendFill = new LinearGradientBrush(new RectangleF(centerX - 330, top + 184, 660, 78), Color.White, Color.FromArgb(255, 57, 142, 101), LinearGradientMode.Vertical))
            {
                DrawOutlinedText(g, "EXPLORERS OF LEGENDS", "Georgia", FontStyle.Bold, 41f, new RectangleF(centerX - 350, top + 182, 700, 76), center, legendFill, Color.FromArgb(255, 43, 86, 54), 13f);
                DrawOutlinedText(g, "EXPLORERS OF LEGENDS", "Georgia", FontStyle.Bold, 41f, new RectangleF(centerX - 350, top + 182, 700, 76), center, legendFill, Color.White, 7f);
                DrawOutlinedText(g, "EXPLORERS OF LEGENDS", "Georgia", FontStyle.Bold, 41f, new RectangleF(centerX - 350, top + 182, 700, 76), center, legendFill, Color.FromArgb(255, 232, 185, 48), 3f);
            }

            g.Restore(saved);
        }

        private void DrawHubBackground(Graphics g)
        {
            g.Clear(Color.FromArgb(255, 50, 133, 74));
            for (int y = 0; y < 14; y += 1)
            {
                for (int x = 0; x < 20; x += 1)
                {
                    string tileId = (x + y * 3) % 7 == 0 || y > 9 ? "grass_dark" : "grass";
                    atlas.DrawTile(g, tileId, x * Tile, y * Tile, Tile);
                }
            }

            using (Brush shade = new SolidBrush(Color.FromArgb(45, 21, 71, 53)))
            {
                g.FillRectangle(shade, 0, 576, 960, 64);
            }

            using (Pen ridge = new Pen(Color.FromArgb(120, 221, 238, 169), 2f))
            {
                g.DrawLine(ridge, 0, 96, 960, 96);
                g.DrawLine(ridge, 0, 578, 960, 578);
            }
        }

        private void DrawGroundGrid(Graphics g)
        {
        }

        private void DrawPath(Graphics g)
        {
            int[,] points =
            {
                {4,7},{5,7},{6,7},{7,7},{8,7},{9,7},{10,7},{11,7},{12,7},{13,7},{14,7},{15,8}
            };
            for (int i = 0; i < points.GetLength(0); i += 1)
            {
                atlas.DrawTile(g, "path", points[i, 0] * Tile, points[i, 1] * Tile, Tile);
            }
        }

        private void DrawBuilding(Graphics g, int x, int y, string label)
        {
            using (Brush shadow = new SolidBrush(Color.FromArgb(65, 21, 46, 42)))
            {
                g.FillRectangle(shadow, x + 10, y + 92, 152, 20);
            }
            using (Brush wall = new SolidBrush(Color.FromArgb(255, 236, 204, 132)))
            using (Brush wallDark = new SolidBrush(Color.FromArgb(255, 190, 145, 84)))
            using (Brush roof = new SolidBrush(Color.FromArgb(255, 51, 101, 175)))
            using (Brush roofLight = new SolidBrush(Color.FromArgb(255, 83, 145, 215)))
            using (Brush door = new SolidBrush(Color.FromArgb(255, 84, 54, 34)))
            using (Brush window = new SolidBrush(Color.FromArgb(255, 255, 238, 140)))
            {
                g.FillRectangle(wall, x + 16, y + 40, 128, 62);
                g.FillRectangle(wallDark, x + 16, y + 90, 128, 12);
                g.FillRectangle(roof, x, y + 24, 160, 24);
                g.FillRectangle(roofLight, x + 18, y + 16, 124, 10);
                g.FillRectangle(roof, x + 36, y + 4, 88, 20);
                g.FillRectangle(door, x + 64, y + 64, 32, 38);
                g.FillRectangle(window, x + 36, y + 58, 18, 16);
                g.FillRectangle(window, x + 106, y + 58, 18, 16);
            }

            using (Font font = new Font("Trebuchet MS", 15f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 24, 56, 111)))
            using (StringFormat format = CenterFormat())
            {
                g.DrawString(label, font, brush, new RectangleF(x - 10, y + 126, 180, 24), format);
            }
        }

        private void DrawCave(Graphics g, int x, int y)
        {
            using (Brush shadow = new SolidBrush(Color.FromArgb(78, 21, 46, 42)))
            using (Brush stone = new SolidBrush(Color.FromArgb(255, 93, 108, 124)))
            using (Brush light = new SolidBrush(Color.FromArgb(255, 126, 142, 157)))
            using (Brush dark = new SolidBrush(Color.FromArgb(255, 36, 44, 62)))
            using (Brush mouth = new SolidBrush(Color.FromArgb(255, 19, 26, 40)))
            {
                g.FillRectangle(shadow, x + 7, y + 106, 130, 18);
                g.FillRectangle(stone, x + 18, y + 22, 102, 86);
                g.FillRectangle(light, x + 34, y + 8, 70, 18);
                g.FillRectangle(stone, x + 6, y + 42, 126, 38);
                g.FillRectangle(dark, x + 22, y + 78, 96, 30);
                g.FillRectangle(mouth, x + 44, y + 54, 52, 54);
                g.FillRectangle(light, x + 18, y + 44, 22, 8);
                g.FillRectangle(light, x + 98, y + 38, 20, 10);
            }
            using (Font font = new Font("Trebuchet MS", 15f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 24, 56, 111)))
            using (StringFormat format = CenterFormat())
            {
                g.DrawString("First Step Cave", font, brush, new RectangleF(x - 30, y + 144, 198, 24), format);
            }
        }

        private void DrawSign(Graphics g, int tileX, int tileY)
        {
            int x = tileX * Tile + 13;
            int y = tileY * Tile + 9;
            using (Brush wood = new SolidBrush(Color.FromArgb(255, 103, 70, 40)))
            using (Brush face = new SolidBrush(Color.FromArgb(255, 236, 202, 118)))
            using (Brush ink = new SolidBrush(Color.FromArgb(255, 54, 63, 57)))
            {
                g.FillRectangle(wood, x + 9, y + 24, 6, 34);
                g.FillRectangle(wood, x - 12, y + 4, 48, 26);
                g.FillRectangle(face, x - 8, y + 8, 40, 16);
                g.FillRectangle(ink, x - 2, y + 12, 28, 3);
                g.FillRectangle(ink, x + 4, y + 18, 18, 3);
            }
        }

        private void DrawTileMarker(Graphics g, int x, int y, Color color, string kind)
        {
            atlas.DrawItem(g, kind, x, y, 36);
        }

        private void DrawPokemonToken(Graphics g, float x, float y, PokemonOption mon, float radius)
        {
            if (mon == null) return;
            atlas.DrawCreature(g, mon, x, y, (int)(radius * 2.3f));
        }

        private void DrawSimpleToken(Graphics g, float x, float y, float radius, Color color, Color accent, string kind)
        {
            using (Brush shadow = new SolidBrush(Color.FromArgb(46, 0, 0, 0)))
            {
                g.FillEllipse(shadow, x - radius * 1.1f, y + radius - 2, radius * 2.2f, 14);
            }
            using (Brush body = new SolidBrush(color))
            using (Pen outline = new Pen(Color.FromArgb(255, 255, 248, 223), 3f))
            {
                g.FillEllipse(body, x - radius, y - radius, radius * 2, radius * 2);
                g.DrawEllipse(outline, x - radius, y - radius, radius * 2, radius * 2);
            }
            using (Brush mark = new SolidBrush(accent))
            {
                if (kind == "leaf" || kind == "steady" || kind == "sprigatito" || kind == "gentle")
                {
                    g.FillEllipse(mark, x - 8, y - radius - 22, 18, 30);
                }
                else if (kind == "flame" || kind == "brave" || kind == "vulpix")
                {
                    PointF[] flame = { new PointF(x + radius - 2, y + 2), new PointF(x + radius + 22, y - 20), new PointF(x + radius + 8, y + 18) };
                    g.FillPolygon(mark, flame);
                }
                else if (kind == "spark" || kind == "restless" || kind == "shinx")
                {
                    PointF[] bolt =
                    {
                        new PointF(x - 4, y - radius - 2),
                        new PointF(x + 8, y - 8),
                        new PointF(x - 1, y - 8),
                        new PointF(x + 7, y + 12),
                        new PointF(x - 12, y - 4),
                        new PointF(x - 2, y - 4)
                    };
                    g.FillPolygon(mark, bolt);
                }
                else
                {
                    g.FillEllipse(mark, x - radius * .45f, y - radius * .58f, radius * .9f, radius * .9f);
                }
            }
            using (Brush eye = new SolidBrush(Color.FromArgb(255, 23, 36, 58)))
            {
                g.FillEllipse(eye, x - radius * .42f, y - radius * .18f, 5, 5);
                g.FillEllipse(eye, x + radius * .28f, y - radius * .18f, 5, 5);
            }
        }

        private void DrawCloud(Graphics g, float x, float y, float scale)
        {
            using (Brush brush = new SolidBrush(Color.FromArgb(235, 255, 255, 255)))
            {
                g.FillEllipse(brush, x - 32 * scale, y - 32 * scale, 64 * scale, 64 * scale);
                g.FillEllipse(brush, x + 36 * scale - 42 * scale, y - 8 * scale - 42 * scale, 84 * scale, 84 * scale);
                g.FillEllipse(brush, x + 80 * scale - 30 * scale, y - 30 * scale, 60 * scale, 60 * scale);
                g.FillRectangle(brush, x - 10 * scale, y, 104 * scale, 34 * scale);
            }
        }

        private void DrawSunburst(Graphics g, float x, float y, float radius)
        {
            GraphicsState saved = g.Save();
            g.TranslateTransform(x, y);
            using (Pen pen = new Pen(Color.FromArgb(198, 255, 255, 255), 3f))
            {
                for (int i = 0; i < 18; i += 1)
                {
                    g.RotateTransform(20f);
                    g.DrawLine(pen, radius * .42f, 0, radius * 1.55f, 0);
                }
            }
            using (GraphicsPath circle = new GraphicsPath())
            {
                circle.AddEllipse(-radius, -radius, radius * 2, radius * 2);
                using (PathGradientBrush glow = new PathGradientBrush(circle))
                {
                    glow.CenterColor = Color.FromArgb(245, 255, 255, 255);
                    glow.SurroundColors = new Color[] { Color.FromArgb(0, 255, 245, 157) };
                    g.FillPath(glow, circle);
                }
            }
            g.Restore(saved);
        }

        private void DrawDistantCliff(Graphics g)
        {
            using (GraphicsPath path = new GraphicsPath())
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 119, 201, 104)))
            {
                path.AddBezier(0, 472, 200, 408, 395, 432, 520, 430);
                path.AddBezier(520, 430, 640, 430, 716, 408, 960, 410);
                path.AddLine(960, 640, 0, 640);
                path.CloseFigure();
                g.FillPath(brush, path);
            }
            using (GraphicsPath path = new GraphicsPath())
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 78, 168, 90)))
            {
                path.AddBezier(0, 530, 238, 492, 430, 526, 560, 532);
                path.AddBezier(560, 532, 700, 555, 812, 500, 960, 502);
                path.AddLine(960, 640, 0, 640);
                path.CloseFigure();
                g.FillPath(brush, path);
            }
        }

        private void DrawAncientArch(Graphics g, float x, float y, float scaleValue)
        {
            GraphicsState saved = g.Save();
            g.TranslateTransform(x, y);
            g.ScaleTransform(scaleValue, scaleValue);
            FillRounded(g, new RectangleF(-82, -116, 164, 172), 20, Color.FromArgb(255, 97, 115, 133), Color.Transparent);
            FillRounded(g, new RectangleF(-48, -70, 96, 126), 33, Color.FromArgb(255, 52, 68, 87), Color.Transparent);
            using (Pen pen = new Pen(Color.FromArgb(255, 215, 179, 78), 6f))
            {
                g.DrawLine(pen, -43, -57, 43, -57);
            }
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 80, 97, 115)))
            {
                g.FillRectangle(brush, -92, 38, 184, 34);
            }
            g.Restore(saved);
        }

        private void DrawTitleTrail(Graphics g)
        {
            using (GraphicsPath path = new GraphicsPath())
            using (Brush pathBrush = new SolidBrush(Color.FromArgb(255, 217, 193, 126)))
            {
                path.AddBezier(472, 420, 530, 490, 486, 640, 486, 640);
                path.AddLine(486, 640, 318, 640);
                path.AddBezier(318, 640, 356, 500, 432, 420, 472, 420);
                path.CloseFigure();
                g.FillPath(pathBrush, path);
            }
            using (Brush mark = new SolidBrush(Color.FromArgb(34, 97, 78, 47)))
            {
                for (int y = 448; y < 640; y += 38)
                {
                    g.FillRectangle(mark, 354 + (y % 3) * 14, y, 130, 8);
                }
            }
        }

        private void AddButton(Graphics g, List<MenuButton> buttons, RectangleF bounds, string label, string command, bool primary)
        {
            buttons.Add(new MenuButton(bounds, label, command, primary));
            Color fill = primary ? Color.FromArgb(255, 38, 100, 172) : Color.FromArgb(255, 255, 248, 218);
            Color stroke = primary ? Color.FromArgb(255, 255, 230, 87) : Color.FromArgb(255, 44, 92, 79);
            Color text = primary ? Color.White : Color.FromArgb(255, 30, 47, 66);
            FillRounded(g, bounds, 8, fill, stroke);
            using (Font font = new Font("Trebuchet MS", 10.5f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(text))
            using (StringFormat format = CenterFormat())
            {
                g.DrawString(label, font, brush, bounds, format);
            }
        }

        private void FillRounded(Graphics g, RectangleF bounds, float radius, Color fill, Color stroke)
        {
            using (GraphicsPath path = RoundedRect(bounds, radius))
            {
                if (fill != Color.Transparent)
                {
                    using (Brush brush = new SolidBrush(fill))
                    {
                        g.FillPath(brush, path);
                    }
                }
                if (stroke != Color.Transparent)
                {
                    using (Pen pen = new Pen(stroke, 3f))
                    {
                        g.DrawPath(pen, path);
                    }
                }
            }
        }

        private GraphicsPath RoundedRect(RectangleF bounds, float radius)
        {
            float diameter = radius * 2f;
            GraphicsPath path = new GraphicsPath();
            path.AddArc(bounds.X, bounds.Y, diameter, diameter, 180, 90);
            path.AddArc(bounds.Right - diameter, bounds.Y, diameter, diameter, 270, 90);
            path.AddArc(bounds.Right - diameter, bounds.Bottom - diameter, diameter, diameter, 0, 90);
            path.AddArc(bounds.X, bounds.Bottom - diameter, diameter, diameter, 90, 90);
            path.CloseFigure();
            return path;
        }

        private void DrawOutlinedText(Graphics g, string text, string familyName, FontStyle style, float size, RectangleF bounds, StringFormat format, Brush fill, Color outline, float outlineWidth)
        {
            using (GraphicsPath path = new GraphicsPath())
            using (FontFamily family = SafeFontFamily(familyName))
            using (Pen pen = new Pen(outline, outlineWidth) { LineJoin = LineJoin.Round })
            {
                path.AddString(text, family, (int)style, size, bounds, format);
                g.DrawPath(pen, path);
                g.FillPath(fill, path);
            }
        }

        private FontFamily SafeFontFamily(string name)
        {
            try
            {
                return new FontFamily(name);
            }
            catch
            {
                return new FontFamily("Arial");
            }
        }

        private StringFormat CenterFormat()
        {
            StringFormat format = new StringFormat();
            format.Alignment = StringAlignment.Center;
            format.LineAlignment = StringAlignment.Center;
            format.Trimming = StringTrimming.EllipsisWord;
            return format;
        }

        private StringFormat NearFormat()
        {
            StringFormat format = new StringFormat();
            format.Alignment = StringAlignment.Near;
            format.LineAlignment = StringAlignment.Near;
            format.Trimming = StringTrimming.EllipsisWord;
            return format;
        }
    }
}
