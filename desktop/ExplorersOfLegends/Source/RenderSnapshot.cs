using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

namespace ExplorersOfLegends
{
    internal static class RenderSnapshot
    {
        public static int SaveTitle(string path)
        {
            return SaveScene("title", path);
        }

        public static int SaveScene(string scene, string path)
        {
            try
            {
                GameState state = CreateState(scene);

                using (Bitmap bitmap = new Bitmap(GameForm.LogicalWidth, GameForm.LogicalHeight))
                using (Graphics graphics = Graphics.FromImage(bitmap))
                {
                    GameRenderer renderer = new GameRenderer();
                    renderer.Draw(graphics, state, new List<MenuButton>(), false);
                    bitmap.Save(path, ImageFormat.Png);
                }
                return 0;
            }
            catch
            {
                return 90;
            }
        }

        private static GameState CreateState(string scene)
        {
            GameState state = new GameState();
            state.Clock = 1.25f;
            state.PlayerPersonality = "steady";
            state.Player = GameData.Starters["steady"].Clone();
            state.Partner = GameData.FindPartner("eevee");
            state.Flags.QuizComplete = true;
            state.Flags.PartnerChosen = true;
            state.Flags.MissionAccepted = true;
            state.Renown.Heroic = 1;
            state.Renown.Explorer = 2;
            state.Renown.Social = 1;
            state.UnspentAp = 3;
            state.LastMessage = "Snapshot render from the desktop game renderer.";

            if (scene == "hub")
            {
                state.Scene = SceneKind.Hub;
                state.ResetPartyForHub();
            }
            else if (scene == "dungeon")
            {
                state.Scene = SceneKind.Dungeon;
                state.Dungeon = DungeonFloor.Create(2);
            }
            else if (scene == "reward")
            {
                state.Scene = SceneKind.Reward;
                state.Flags.ChapterOneComplete = true;
                state.Flags.SliceComplete = true;
            }
            else if (scene == "quiz")
            {
                state.Scene = SceneKind.Quiz;
                state.ResetForNewGame();
            }
            else
            {
                state.Scene = SceneKind.Title;
            }

            return state;
        }
    }
}
