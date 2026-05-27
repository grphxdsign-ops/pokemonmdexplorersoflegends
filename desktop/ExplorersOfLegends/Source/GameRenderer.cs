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

        public void Draw(Graphics g, GameState state, List<MenuButton> buttons, bool hasSave)
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
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
            g.Clear(Color.FromArgb(255, 38, 48, 68));
            DungeonFloor dungeon = state.Dungeon;
            if (dungeon == null) return;

            int offsetX = 160;
            int offsetY = 92;
            for (int y = 0; y < dungeon.Height; y += 1)
            {
                for (int x = 0; x < dungeon.Width; x += 1)
                {
                    Rectangle rect = new Rectangle(offsetX + x * Tile, offsetY + y * Tile, Tile, Tile);
                    bool wall = dungeon.Tiles[x, y] == TileKind.Wall;
                    using (Brush brush = new SolidBrush(wall ? Color.FromArgb(255, 82, 96, 112) : Color.FromArgb(255, 183, 164, 122)))
                    using (Pen pen = new Pen(wall ? Color.FromArgb(255, 61, 70, 83) : Color.FromArgb(255, 141, 121, 86), 2f))
                    {
                        g.FillRectangle(brush, rect);
                        g.DrawRectangle(pen, rect);
                    }
                }
            }

            DrawTileMarker(g, offsetX + dungeon.Stairs.X * Tile + 24, offsetY + dungeon.Stairs.Y * Tile + 24, Color.FromArgb(255, 86, 178, 255), "stairs");
            if (dungeon.Apple != null && !dungeon.Apple.Found) DrawTileMarker(g, offsetX + dungeon.Apple.X * Tile + 24, offsetY + dungeon.Apple.Y * Tile + 24, Color.FromArgb(255, 240, 79, 56), "apple");
            if (dungeon.Badge != null && !dungeon.Badge.Found) DrawTileMarker(g, offsetX + dungeon.Badge.X * Tile + 24, offsetY + dungeon.Badge.Y * Tile + 24, Color.FromArgb(255, 255, 216, 87), "badge");

            for (int i = 0; i < dungeon.Enemies.Count; i += 1)
            {
                Enemy enemy = dungeon.Enemies[i];
                PokemonOption wild = new PokemonOption { Id = "wild", Species = enemy.Species, Color = enemy.Color, Accent = Color.FromArgb(255, 52, 42, 61) };
                DrawPokemonToken(g, offsetX + enemy.X * Tile + 24, offsetY + enemy.Y * Tile + 24, wild, 17);
            }

            DrawPokemonToken(g, offsetX + dungeon.PartnerX * Tile + 24, offsetY + dungeon.PartnerY * Tile + 26, state.Partner, 18);
            DrawPokemonToken(g, offsetX + dungeon.PlayerX * Tile + 24, offsetY + dungeon.PlayerY * Tile + 24, state.Player, 20);

            using (Font font = new Font("Trebuchet MS", 22f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 255, 248, 223)))
            {
                g.DrawString("First Step Cave B" + dungeon.Floor + "F", font, brush, new PointF(160, 56));
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
            DrawSimpleToken(g, 244, 462, 33, Color.FromArgb(255, 93, 187, 107), Color.FromArgb(255, 36, 95, 57), "leaf");
            DrawSimpleToken(g, 303, 464, 33, Color.FromArgb(255, 242, 138, 56), Color.FromArgb(255, 163, 58, 24), "flame");
            DrawSimpleToken(g, 360, 461, 32, Color.FromArgb(255, 247, 207, 61), Color.FromArgb(255, 125, 90, 22), "spark");
            DrawCloud(g, 382, 496, 1.45f);
            DrawCloud(g, 718, 512, 1.7f);
        }

        private void DrawWordmark(Graphics g, float centerX, float top, float scaleValue)
        {
            GraphicsState saved = g.Save();
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
            using (LinearGradientBrush sky = new LinearGradientBrush(new Rectangle(0, 0, 960, 640), Color.FromArgb(255, 117, 212, 255), Color.FromArgb(255, 59, 158, 77), LinearGradientMode.Vertical))
            {
                g.FillRectangle(sky, 0, 0, 960, 640);
            }
            DrawCloud(g, 130, 90, 1.15f);
            DrawCloud(g, 720, 78, .9f);
            DrawCloud(g, 500, 150, .7f);

            using (Brush hill = new SolidBrush(Color.FromArgb(255, 95, 184, 90)))
            {
                g.FillEllipse(hill, -40, 390, 560, 260);
            }
            using (Brush hill = new SolidBrush(Color.FromArgb(255, 74, 160, 82)))
            {
                g.FillEllipse(hill, 410, 415, 650, 260);
            }
        }

        private void DrawGroundGrid(Graphics g)
        {
            using (Pen pen = new Pen(Color.FromArgb(60, 37, 101, 55), 1f))
            {
                for (int x = 0; x < 960; x += Tile) g.DrawLine(pen, x, 0, x, 640);
                for (int y = 0; y < 640; y += Tile) g.DrawLine(pen, 0, y, 960, y);
            }
        }

        private void DrawPath(Graphics g)
        {
            int[,] points =
            {
                {4,7},{5,7},{6,7},{7,7},{8,7},{9,7},{10,7},{11,7},{12,7},{13,7},{14,7},{15,8}
            };
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 216, 189, 124)))
            {
                for (int i = 0; i < points.GetLength(0); i += 1)
                {
                    using (GraphicsPath path = RoundedRect(new RectangleF(points[i, 0] * Tile + 5, points[i, 1] * Tile + 8, 38, 30), 8))
                    {
                        g.FillPath(brush, path);
                    }
                }
            }
        }

        private void DrawBuilding(Graphics g, int x, int y, string label)
        {
            FillRounded(g, new RectangleF(x, y, 160, 106), 12, Color.FromArgb(255, 245, 209, 119), Color.Transparent);
            using (Brush roof = new SolidBrush(Color.FromArgb(255, 49, 95, 168)))
            using (GraphicsPath path = new GraphicsPath())
            {
                path.AddPolygon(new PointF[] { new PointF(x - 12, y + 26), new PointF(x + 80, y - 28), new PointF(x + 172, y + 26) });
                g.FillPath(roof, path);
            }
            FillRounded(g, new RectangleF(x + 63, y + 52, 36, 54), 8, Color.FromArgb(255, 90, 57, 33), Color.Transparent);
            using (Font font = new Font("Trebuchet MS", 15f, FontStyle.Bold))
            using (Brush brush = new SolidBrush(Color.FromArgb(255, 24, 56, 111)))
            using (StringFormat format = CenterFormat())
            {
                g.DrawString(label, font, brush, new RectangleF(x - 10, y + 126, 180, 24), format);
            }
        }

        private void DrawCave(Graphics g, int x, int y)
        {
            FillRounded(g, new RectangleF(x, y, 138, 122), 22, Color.FromArgb(255, 102, 115, 130), Color.Transparent);
            FillRounded(g, new RectangleF(x + 33, y + 34, 72, 88), 28, Color.FromArgb(255, 32, 42, 62), Color.Transparent);
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
            using (Pen post = new Pen(Color.FromArgb(255, 88, 57, 33), 6f))
            {
                g.DrawLine(post, x + 11, y + 30, x + 11, y + 56);
            }
            FillRounded(g, new RectangleF(x - 10, y, 42, 30), 6, Color.FromArgb(255, 245, 209, 119), Color.FromArgb(255, 88, 57, 33));
        }

        private void DrawTileMarker(Graphics g, int x, int y, Color color, string kind)
        {
            using (Brush brush = new SolidBrush(color))
            using (Pen pen = new Pen(Color.FromArgb(255, 255, 248, 223), 3f))
            {
                if (kind == "stairs")
                {
                    PointF[] points = { new PointF(x, y - 16), new PointF(x + 16, y), new PointF(x, y + 16), new PointF(x - 16, y) };
                    g.FillPolygon(brush, points);
                    g.DrawPolygon(pen, points);
                }
                else
                {
                    g.FillEllipse(brush, x - 15, y - 15, 30, 30);
                    g.DrawEllipse(pen, x - 15, y - 15, 30, 30);
                }
            }
        }

        private void DrawPokemonToken(Graphics g, float x, float y, PokemonOption mon, float radius)
        {
            if (mon == null) return;
            DrawSimpleToken(g, x, y, radius, mon.Color, mon.Accent, mon.Id);
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
