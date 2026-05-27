using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace ExplorersOfLegends
{
    public sealed class GameForm : Form
    {
        public const int LogicalWidth = 960;
        public const int LogicalHeight = 640;

        private readonly GameState state;
        private readonly GameRenderer renderer;
        private readonly Timer frameTimer;
        private readonly List<MenuButton> buttons;
        private readonly Random random;
        private RectangleF viewport;
        private float scale;
        private Action dialogueDone;

        public GameForm()
        {
            state = new GameState();
            renderer = new GameRenderer();
            buttons = new List<MenuButton>();
            random = new Random();
            scale = 1f;
            viewport = new RectangleF(0, 0, LogicalWidth, LogicalHeight);

            Text = GameData.Title;
            ClientSize = new Size(LogicalWidth, LogicalHeight);
            MinimumSize = new Size(800, 540);
            StartPosition = FormStartPosition.CenterScreen;
            KeyPreview = true;
            DoubleBuffered = true;
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint, true);

            frameTimer = new Timer();
            frameTimer.Interval = 16;
            frameTimer.Tick += OnFrame;
            frameTimer.Start();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            e.Graphics.Clear(Color.Black);
            ConfigureViewport();
            buttons.Clear();

            e.Graphics.TranslateTransform(viewport.X, viewport.Y);
            e.Graphics.ScaleTransform(scale, scale);
            renderer.Draw(e.Graphics, state, buttons, SaveManager.HasSave());
            e.Graphics.ResetTransform();
        }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            base.OnMouseDown(e);
            PointF world = ToWorld(e.Location);
            for (int i = buttons.Count - 1; i >= 0; i -= 1)
            {
                if (buttons[i].Bounds.Contains(world))
                {
                    ActivateCommand(buttons[i].Command);
                    Invalidate();
                    return;
                }
            }

            if (state.Scene == SceneKind.Dialogue)
            {
                NextDialogue();
                Invalidate();
            }
        }

        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            Keys key = keyData & Keys.KeyCode;
            if (HandleKey(key))
            {
                Invalidate();
                return true;
            }
            return base.ProcessCmdKey(ref msg, keyData);
        }

        private void OnFrame(object sender, EventArgs e)
        {
            state.Clock += 0.016f;
            if (state.Scene == SceneKind.Loading)
            {
                double elapsed = (DateTime.Now - state.LoadingStarted).TotalSeconds;
                state.LoadingProgress = (float)Math.Min(1.0, elapsed / 1.85);
                if (state.LoadingProgress >= 1f) ShowTitle();
            }
            Invalidate();
        }

        private void ConfigureViewport()
        {
            float sx = ClientSize.Width / (float)LogicalWidth;
            float sy = ClientSize.Height / (float)LogicalHeight;
            scale = Math.Min(sx, sy);
            float width = LogicalWidth * scale;
            float height = LogicalHeight * scale;
            viewport = new RectangleF((ClientSize.Width - width) / 2f, (ClientSize.Height - height) / 2f, width, height);
        }

        private PointF ToWorld(Point point)
        {
            return new PointF((point.X - viewport.X) / scale, (point.Y - viewport.Y) / scale);
        }

        private bool HandleKey(Keys key)
        {
            if (key == Keys.Space || key == Keys.Enter)
            {
                if (state.Scene == SceneKind.Dialogue) NextDialogue();
                else Interact();
                return true;
            }

            int dx = 0;
            int dy = 0;
            if (key == Keys.Left || key == Keys.A) dx = -1;
            else if (key == Keys.Right || key == Keys.D) dx = 1;
            else if (key == Keys.Up || key == Keys.W) dy = -1;
            else if (key == Keys.Down || key == Keys.S) dy = 1;
            else return false;

            MoveParty(dx, dy);
            return true;
        }

        private void ActivateCommand(string command)
        {
            if (command == "new-game") BeginNewGame();
            else if (command == "continue") ContinueGame();
            else if (command == "reset-save") ResetSave();
            else if (command == "choose-partner") ShowPartnerSelect();
            else if (command == "title") ShowTitle();
            else if (command.StartsWith("quiz:", StringComparison.Ordinal)) AnswerQuiz(int.Parse(command.Substring(5)));
            else if (command.StartsWith("partner:", StringComparison.Ordinal)) ChoosePartner(command.Substring(8));
            else if (command.StartsWith("ap:", StringComparison.Ordinal)) SpendAp(command.Substring(3));
        }

        private void ShowTitle()
        {
            state.Scene = SceneKind.Title;
            state.LastMessage = "New Game starts the desktop prologue. Continue loads slot 1.";
        }

        private void BeginNewGame()
        {
            state.ResetForNewGame();
        }

        private void ContinueGame()
        {
            if (!SaveManager.Load(state))
            {
                BeginNewGame();
                return;
            }

            RefreshDerivedStats();
            if (state.Flags.ChapterOneComplete) ShowReward();
            else StartHub();
        }

        private void ResetSave()
        {
            SaveManager.DeleteSave();
            state.LastMessage = "Save slot cleared.";
            ShowTitle();
        }

        private void AnswerQuiz(int index)
        {
            if (state.Scene != SceneKind.Quiz) return;
            QuizQuestion question = GameData.Quiz[state.QuizIndex];
            if (index < 0 || index >= question.Answers.Count) return;

            QuizAnswer answer = question.Answers[index];
            foreach (KeyValuePair<string, int> score in answer.Scores)
            {
                state.QuizScores[score.Key] += score.Value;
            }

            state.QuizIndex += 1;
            if (state.QuizIndex < GameData.Quiz.Count) return;
            FinishQuiz();
        }

        private void FinishQuiz()
        {
            string best = "steady";
            foreach (KeyValuePair<string, int> score in state.QuizScores)
            {
                if (score.Value > state.QuizScores[best]) best = score.Key;
            }

            state.PlayerPersonality = best;
            state.Player = GameData.Starters[best].Clone();
            state.Flags.QuizComplete = true;
            state.LastMessage = "The quiz suggested " + state.Player.Species + ".";
        }

        private void ShowPartnerSelect()
        {
            state.Scene = SceneKind.PartnerSelect;
            state.LastMessage = "Choose the partner species. Their ambition stays fixed.";
        }

        private void ChoosePartner(string id)
        {
            PokemonOption partner = GameData.FindPartner(id);
            if (partner == null) return;
            state.Partner = partner;
            state.Flags.PartnerChosen = true;
            ShowDialogue(GameData.PrologueLines, StartHub, SceneKind.Title);
        }

        private void StartHub()
        {
            RefreshDerivedStats();
            state.ResetPartyForHub();
            state.Scene = SceneKind.Hub;
            state.LastMessage = "Visit the request board, then enter First Step Cave.";
            SaveManager.Save(state);
        }

        private void ShowDialogue(List<DialogueLine> lines, Action onDone, SceneKind backdrop)
        {
            state.Dialogue = new List<DialogueLine>(lines);
            state.DialogueIndex = 0;
            state.DialogueBackdrop = backdrop;
            dialogueDone = onDone;
            state.Scene = SceneKind.Dialogue;
        }

        private void NextDialogue()
        {
            if (state.Scene != SceneKind.Dialogue) return;
            state.DialogueIndex += 1;
            if (state.DialogueIndex < state.Dialogue.Count) return;

            Action done = dialogueDone;
            dialogueDone = null;
            if (done != null) done();
            else state.Scene = SceneKind.Title;
        }

        private void MoveParty(int dx, int dy)
        {
            if (state.Scene == SceneKind.Hub) MoveHub(dx, dy);
            else if (state.Scene == SceneKind.Dungeon) MoveDungeon(dx, dy);
        }

        private void MoveHub(int dx, int dy)
        {
            int nx = state.Party.X + dx;
            int ny = state.Party.Y + dy;
            if (nx < 1 || nx > 18 || ny < 2 || ny > 11) return;
            if ((nx == 3 && ny == 3) || (nx == 16 && ny == 8) || (nx == 10 && ny == 5)) return;

            state.Party.PartnerX = state.Party.X;
            state.Party.PartnerY = state.Party.Y;
            state.Party.X = nx;
            state.Party.Y = ny;
        }

        private void Interact()
        {
            if (state.Scene != SceneKind.Hub) return;

            if (Near(3, 3)) AcceptMission();
            else if (Near(16, 8)) StartDungeon();
            else if (Near(10, 5)) state.LastMessage = "The town sign reads: Lowstep Supply Yard. Nothing ever happens here, supposedly.";
            else state.LastMessage = "Nothing to inspect here.";
        }

        private bool Near(int x, int y)
        {
            return Math.Abs(state.Party.X - x) + Math.Abs(state.Party.Y - y) <= 1;
        }

        private void AcceptMission()
        {
            if (state.Flags.MissionAccepted)
            {
                state.LastMessage = "The mission is already accepted. Head to First Step Cave.";
                return;
            }

            state.Flags.MissionAccepted = true;
            ShowDialogue(GameData.MissionLines, delegate
            {
                state.LastMessage = "Mission accepted. Enter First Step Cave at the east path.";
                state.Scene = SceneKind.Hub;
                SaveManager.Save(state);
            }, SceneKind.Hub);
        }

        private void StartDungeon()
        {
            if (!state.Flags.MissionAccepted)
            {
                state.LastMessage = "The partner points back to the request board first.";
                return;
            }

            RefreshDerivedStats();
            state.Dungeon = DungeonFloor.Create(1);
            state.Party.Hp = state.Party.MaxHp;
            state.Scene = SceneKind.Dungeon;
            state.LastMessage = "Find the stairs. On floor 4, recover the courier badge.";
        }

        private void MoveDungeon(int dx, int dy)
        {
            DungeonFloor dungeon = state.Dungeon;
            if (dungeon == null) return;

            int nx = dungeon.PlayerX + dx;
            int ny = dungeon.PlayerY + dy;
            if (!dungeon.IsFloor(nx, ny)) return;

            Enemy enemy = dungeon.EnemyAt(nx, ny);
            if (enemy != null)
            {
                AttackEnemy(enemy);
                EnemyTurn();
                return;
            }

            dungeon.PartnerX = dungeon.PlayerX;
            dungeon.PartnerY = dungeon.PlayerY;
            dungeon.PlayerX = nx;
            dungeon.PlayerY = ny;

            if (dungeon.Apple != null && !dungeon.Apple.Found && dungeon.Apple.X == nx && dungeon.Apple.Y == ny)
            {
                dungeon.Apple.Found = true;
                state.Party.Hp = Math.Min(state.Party.MaxHp, state.Party.Hp + 6);
                state.LastMessage = "Found an apple. The team recovered HP.";
            }

            if (dungeon.Badge != null && !dungeon.Badge.Found && dungeon.Badge.X == nx && dungeon.Badge.Y == ny)
            {
                dungeon.Badge.Found = true;
                state.LastMessage = "Recovered the missing courier badge.";
            }

            if (dungeon.Stairs.X == nx && dungeon.Stairs.Y == ny)
            {
                if (dungeon.Floor == 4 && (dungeon.Badge == null || !dungeon.Badge.Found))
                {
                    state.LastMessage = "The stairs shimmer, but the badge is still missing.";
                    return;
                }
                NextFloor();
                return;
            }

            EnemyTurn();
        }

        private void AttackEnemy(Enemy enemy)
        {
            int hitChance = Math.Min(98, 88 + state.PlayerAp.Speed * 3);
            if (random.Next(100) >= hitChance)
            {
                state.LastMessage = state.Player.Species + " missed. Speed AP improves accuracy and evasion.";
                return;
            }

            int damage = 1 + state.PlayerAp.Attack;
            enemy.Hp -= damage;
            state.LastMessage = state.Player.Species + " used Tackle on " + enemy.Species + " for " + damage + " damage.";
            if (enemy.Hp <= 0)
            {
                state.Dungeon.Enemies.Remove(enemy);
                state.Renown.Explorer += 1;
                state.LastMessage = enemy.Species + " fled deeper into the cave. Explorer Renown rose.";
            }
        }

        private void EnemyTurn()
        {
            DungeonFloor dungeon = state.Dungeon;
            if (dungeon == null) return;

            for (int i = 0; i < dungeon.Enemies.Count; i += 1)
            {
                Enemy enemy = dungeon.Enemies[i];
                int distance = Math.Abs(enemy.X - dungeon.PlayerX) + Math.Abs(enemy.Y - dungeon.PlayerY);
                if (distance == 1)
                {
                    int evadeChance = Math.Min(35, state.PlayerAp.Speed * 3);
                    if (random.Next(100) < evadeChance)
                    {
                        state.LastMessage = enemy.Species + " missed as the team slipped aside.";
                        continue;
                    }

                    int damage = Math.Max(1, 3 - state.PlayerAp.Defense);
                    state.Party.Hp -= damage;
                    state.LastMessage = enemy.Species + " bumped the team for " + damage + " damage.";
                }
                else if (distance < 6)
                {
                    int stepX = Math.Sign(dungeon.PlayerX - enemy.X);
                    int stepY = Math.Sign(dungeon.PlayerY - enemy.Y);
                    bool horizontal = Math.Abs(dungeon.PlayerX - enemy.X) > Math.Abs(dungeon.PlayerY - enemy.Y);
                    int tryX = enemy.X + (horizontal ? stepX : 0);
                    int tryY = enemy.Y + (horizontal ? 0 : stepY);
                    if (dungeon.IsFloor(tryX, tryY) && dungeon.EnemyAt(tryX, tryY) == null &&
                        !(tryX == dungeon.PlayerX && tryY == dungeon.PlayerY))
                    {
                        enemy.X = tryX;
                        enemy.Y = tryY;
                    }
                }
            }

            if (state.Party.Hp <= 0)
            {
                int floor = Math.Max(1, dungeon.Floor);
                state.Party.Hp = state.Party.MaxHp;
                state.Dungeon = DungeonFloor.Create(floor);
                state.LastMessage = "The team steadied themselves and returned to the floor entrance.";
            }
        }

        private void NextFloor()
        {
            int floor = state.Dungeon.Floor;
            if (floor < 4)
            {
                state.Dungeon = DungeonFloor.Create(floor + 1);
                state.LastMessage = "First Step Cave B" + (floor + 1) + "F.";
                return;
            }
            CompleteChapter();
        }

        private void CompleteChapter()
        {
            state.Flags.PrologueComplete = true;
            state.Flags.ChapterOneComplete = true;
            state.Flags.SliceComplete = true;
            state.Renown.Heroic += 1;
            state.Renown.Explorer += 2;
            state.Renown.Social += 1;
            state.UnspentAp += 3;
            SaveManager.Save(state);
            ShowDialogue(GameData.ArcanineLines, ShowReward, SceneKind.Dungeon);
        }

        private void ShowReward()
        {
            RefreshDerivedStats();
            state.Scene = SceneKind.Reward;
            state.LastMessage = "Chapter 1 complete. AP costs are equal across all Pokemon.";
        }

        private void SpendAp(string statId)
        {
            if (state.UnspentAp <= 0)
            {
                state.LastMessage = "No Attribute Points left to spend.";
                return;
            }

            state.PlayerAp.Increment(statId);
            state.PartnerAp.Increment(statId);
            state.UnspentAp -= 1;
            RefreshDerivedStats();
            SaveManager.Save(state);
            state.LastMessage = "Team training increased " + statId + ".";
        }

        private void RefreshDerivedStats()
        {
            state.Party.MaxHp = 24 + state.PlayerAp.Hp * 4;
            if (state.Party.Hp > state.Party.MaxHp) state.Party.Hp = state.Party.MaxHp;
            if (state.Party.Hp <= 0) state.Party.Hp = state.Party.MaxHp;
        }
    }
}
