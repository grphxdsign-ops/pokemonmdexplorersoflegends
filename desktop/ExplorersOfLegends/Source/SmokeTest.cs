using System;
using System.IO;

namespace ExplorersOfLegends
{
    internal static class SmokeTest
    {
        public static int Run()
        {
            try
            {
                if (GameData.Quiz.Count != 3) return 10;
                if (GameData.Partners.Count < 6) return 11;
                if (!GameData.Starters.ContainsKey("steady")) return 12;

                DungeonFloor floorOne = DungeonFloor.Create(1);
                DungeonFloor floorFour = DungeonFloor.Create(4);
                if (!floorOne.IsFloor(1, 1)) return 20;
                if (floorFour.Badge == null) return 21;
                if (floorFour.Enemies.Count != 2) return 22;

                GameState state = new GameState();
                state.ResetForNewGame();
                state.PlayerPersonality = "steady";
                state.Player = GameData.Starters["steady"].Clone();
                state.Partner = GameData.FindPartner("eevee");
                state.Flags.QuizComplete = true;
                state.Flags.PartnerChosen = true;
                state.Flags.ChapterOneComplete = true;
                state.Renown.Heroic = 1;
                state.UnspentAp = 3;
                state.PlayerAp.Speed = 1;

                string tempDir = Path.Combine(Path.GetTempPath(), "ExplorersOfLegendsSmoke");
                string tempSave = Path.Combine(tempDir, "save.slot1");
                SaveManager.SavePathOverride = tempSave;
                SaveManager.Save(state);

                GameState loaded = new GameState();
                if (!SaveManager.Load(loaded)) return 30;
                if (loaded.Player == null || loaded.Player.Species != "Bulbasaur") return 31;
                if (loaded.Partner == null || loaded.Partner.Species != "Eevee") return 32;
                if (!loaded.Flags.ChapterOneComplete) return 33;
                if (loaded.PlayerAp.Speed != 1) return 34;

                if (File.Exists(tempSave)) File.Delete(tempSave);
                return 0;
            }
            catch
            {
                return 99;
            }
        }
    }
}
