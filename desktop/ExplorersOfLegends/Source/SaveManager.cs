using System;
using System.Collections.Generic;
using System.IO;

namespace ExplorersOfLegends
{
    public static class SaveManager
    {
        public static string SavePathOverride;

        public static string SaveDirectory
        {
            get
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                return Path.Combine(appData, "ExplorersOfLegends");
            }
        }

        public static string SavePath
        {
            get
            {
                if (!string.IsNullOrEmpty(SavePathOverride)) return SavePathOverride;
                return Path.Combine(SaveDirectory, "save.slot1");
            }
        }

        public static bool HasSave()
        {
            return File.Exists(SavePath);
        }

        public static void DeleteSave()
        {
            if (File.Exists(SavePath)) File.Delete(SavePath);
        }

        public static void Save(GameState state)
        {
            string directory = Path.GetDirectoryName(SavePath);
            if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

            List<string> lines = new List<string>();
            lines.Add("version=1");
            lines.Add("playerPersonality=" + Safe(state.PlayerPersonality));
            lines.Add("partnerId=" + Safe(state.Partner == null ? "" : state.Partner.Id));
            lines.Add("teamName=" + Safe(state.TeamName));
            lines.Add("renownHeroic=" + state.Renown.Heroic);
            lines.Add("renownExplorer=" + state.Renown.Explorer);
            lines.Add("renownSocial=" + state.Renown.Social);
            lines.Add("unspentAp=" + state.UnspentAp);
            WriteAp(lines, "player", state.PlayerAp);
            WriteAp(lines, "partner", state.PartnerAp);
            lines.Add("quizComplete=" + state.Flags.QuizComplete);
            lines.Add("partnerChosen=" + state.Flags.PartnerChosen);
            lines.Add("missionAccepted=" + state.Flags.MissionAccepted);
            lines.Add("prologueComplete=" + state.Flags.PrologueComplete);
            lines.Add("chapterOneComplete=" + state.Flags.ChapterOneComplete);
            lines.Add("sliceComplete=" + state.Flags.SliceComplete);

            File.WriteAllLines(SavePath, lines.ToArray());
        }

        public static bool Load(GameState state)
        {
            if (!File.Exists(SavePath)) return false;

            Dictionary<string, string> values = ReadValues(SavePath);
            string personality = Get(values, "playerPersonality", "steady");
            if (!GameData.Starters.ContainsKey(personality)) personality = "steady";
            state.PlayerPersonality = personality;
            state.Player = GameData.Starters[personality].Clone();

            string partnerId = Get(values, "partnerId", "eevee");
            state.Partner = GameData.FindPartner(partnerId);
            if (state.Partner == null) state.Partner = GameData.Partners[0].Clone();

            state.TeamName = Get(values, "teamName", "Lowstep");
            state.Renown.Heroic = GetInt(values, "renownHeroic", 0);
            state.Renown.Explorer = GetInt(values, "renownExplorer", 0);
            state.Renown.Social = GetInt(values, "renownSocial", 0);
            state.UnspentAp = GetInt(values, "unspentAp", 0);
            ReadAp(values, "player", state.PlayerAp);
            ReadAp(values, "partner", state.PartnerAp);
            state.Flags.QuizComplete = GetBool(values, "quizComplete", true);
            state.Flags.PartnerChosen = GetBool(values, "partnerChosen", true);
            state.Flags.MissionAccepted = GetBool(values, "missionAccepted", false);
            state.Flags.PrologueComplete = GetBool(values, "prologueComplete", false);
            state.Flags.ChapterOneComplete = GetBool(values, "chapterOneComplete", false);
            state.Flags.SliceComplete = GetBool(values, "sliceComplete", false);
            state.ResetPartyForHub();
            state.LastMessage = state.Flags.ChapterOneComplete
                ? "Chapter 1 is complete. Spend AP or start a new run."
                : "Save loaded. Visit the request board or First Step Cave.";
            return true;
        }

        private static void WriteAp(List<string> lines, string prefix, ApSpread ap)
        {
            lines.Add(prefix + "ApHp=" + ap.Hp);
            lines.Add(prefix + "ApAttack=" + ap.Attack);
            lines.Add(prefix + "ApDefense=" + ap.Defense);
            lines.Add(prefix + "ApSpecialAttack=" + ap.SpecialAttack);
            lines.Add(prefix + "ApSpecialDefense=" + ap.SpecialDefense);
            lines.Add(prefix + "ApSpeed=" + ap.Speed);
        }

        private static void ReadAp(Dictionary<string, string> values, string prefix, ApSpread ap)
        {
            ap.Hp = GetInt(values, prefix + "ApHp", 0);
            ap.Attack = GetInt(values, prefix + "ApAttack", 0);
            ap.Defense = GetInt(values, prefix + "ApDefense", 0);
            ap.SpecialAttack = GetInt(values, prefix + "ApSpecialAttack", 0);
            ap.SpecialDefense = GetInt(values, prefix + "ApSpecialDefense", 0);
            ap.Speed = GetInt(values, prefix + "ApSpeed", 0);
        }

        private static Dictionary<string, string> ReadValues(string path)
        {
            Dictionary<string, string> values = new Dictionary<string, string>();
            string[] lines = File.ReadAllLines(path);
            for (int i = 0; i < lines.Length; i += 1)
            {
                string line = lines[i];
                int split = line.IndexOf('=');
                if (split <= 0) continue;
                string key = line.Substring(0, split);
                string value = line.Substring(split + 1).Replace("%3D", "=").Replace("%25", "%");
                values[key] = value;
            }
            return values;
        }

        private static string Safe(string value)
        {
            if (value == null) return "";
            return value.Replace("%", "%25").Replace("=", "%3D");
        }

        private static string Get(Dictionary<string, string> values, string key, string fallback)
        {
            string value;
            return values.TryGetValue(key, out value) ? value : fallback;
        }

        private static int GetInt(Dictionary<string, string> values, string key, int fallback)
        {
            string value;
            if (!values.TryGetValue(key, out value)) return fallback;
            int result;
            return int.TryParse(value, out result) ? result : fallback;
        }

        private static bool GetBool(Dictionary<string, string> values, string key, bool fallback)
        {
            string value;
            if (!values.TryGetValue(key, out value)) return fallback;
            bool result;
            return bool.TryParse(value, out result) ? result : fallback;
        }
    }
}
