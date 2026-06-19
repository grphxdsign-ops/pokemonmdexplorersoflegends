using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;
using System.Xml;

namespace ExplorersOfLegends
{
    public sealed class ExternalSpriteProvider : IDisposable
    {
        private readonly string rawAssetRoot;
        private readonly Dictionary<string, string> speciesToId;
        private readonly Dictionary<string, Bitmap> cache;

        public ExternalSpriteProvider()
        {
            rawAssetRoot = FindRawAssetRoot();
            speciesToId = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            cache = new Dictionary<string, Bitmap>(StringComparer.OrdinalIgnoreCase);
            AddBuiltInSpeciesIds();
            LoadTransferJson();
        }

        public bool IsAvailable
        {
            get { return !string.IsNullOrEmpty(rawAssetRoot) && Directory.Exists(Path.Combine(rawAssetRoot, "Sprite")); }
        }

        public string RootPath
        {
            get { return rawAssetRoot; }
        }

        public void Dispose()
        {
            foreach (Bitmap bitmap in cache.Values)
            {
                bitmap.Dispose();
            }
            cache.Clear();
        }

        public bool TryGetCreature(PokemonOption mon, out Bitmap sprite)
        {
            sprite = null;
            if (mon == null || !IsAvailable) return false;

            string species = mon.Species;
            if (string.IsNullOrEmpty(species)) return false;

            string id;
            if (!speciesToId.TryGetValue(species, out id)) return false;

            if (cache.TryGetValue(id, out sprite)) return sprite != null;

            string folder = Path.Combine(rawAssetRoot, "Sprite", id);
            sprite = LoadFirstFrame(folder, "Idle") ?? LoadFirstFrame(folder, "Walk");
            cache[id] = sprite;
            return sprite != null;
        }

        private Bitmap LoadFirstFrame(string folder, string animation)
        {
            string sheetPath = Path.Combine(folder, animation + "-Anim.png");
            string xmlPath = Path.Combine(folder, "AnimData.xml");
            if (!File.Exists(sheetPath) || !File.Exists(xmlPath)) return null;

            Size frameSize = ReadFrameSize(xmlPath, animation);
            if (frameSize.Width <= 0 || frameSize.Height <= 0) return null;

            using (Bitmap sheet = new Bitmap(sheetPath))
            {
                int width = Math.Min(frameSize.Width, sheet.Width);
                int height = Math.Min(frameSize.Height, sheet.Height);
                if (width <= 0 || height <= 0) return null;

                Bitmap frame = new Bitmap(width, height, PixelFormat.Format32bppArgb);
                using (Graphics g = Graphics.FromImage(frame))
                {
                    g.Clear(Color.Transparent);
                    g.DrawImage(sheet, new Rectangle(0, 0, width, height), new Rectangle(0, 0, width, height), GraphicsUnit.Pixel);
                }
                return CropTransparent(frame);
            }
        }

        private Size ReadFrameSize(string xmlPath, string animation)
        {
            XmlDocument doc = new XmlDocument();
            doc.Load(xmlPath);

            XmlNodeList anims = doc.SelectNodes("//Anim");
            if (anims == null) return Size.Empty;

            for (int i = 0; i < anims.Count; i += 1)
            {
                XmlNode anim = anims[i];
                XmlNode name = anim.SelectSingleNode("Name");
                if (name == null || !string.Equals(name.InnerText, animation, StringComparison.OrdinalIgnoreCase)) continue;

                XmlNode frameWidth = anim.SelectSingleNode("FrameWidth");
                XmlNode frameHeight = anim.SelectSingleNode("FrameHeight");
                if (frameWidth == null || frameHeight == null) return Size.Empty;

                int width;
                int height;
                if (int.TryParse(frameWidth.InnerText, out width) && int.TryParse(frameHeight.InnerText, out height))
                {
                    return new Size(width, height);
                }
            }

            return Size.Empty;
        }

        private Bitmap CropTransparent(Bitmap source)
        {
            Rectangle bounds = FindOpaqueBounds(source);
            if (bounds.Width <= 0 || bounds.Height <= 0) return source;
            if (bounds.Width == source.Width && bounds.Height == source.Height) return source;

            Bitmap cropped = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(cropped))
            {
                g.Clear(Color.Transparent);
                g.DrawImage(source, new Rectangle(0, 0, cropped.Width, cropped.Height), bounds, GraphicsUnit.Pixel);
            }
            source.Dispose();
            return cropped;
        }

        private Rectangle FindOpaqueBounds(Bitmap bitmap)
        {
            int minX = bitmap.Width;
            int minY = bitmap.Height;
            int maxX = -1;
            int maxY = -1;

            for (int y = 0; y < bitmap.Height; y += 1)
            {
                for (int x = 0; x < bitmap.Width; x += 1)
                {
                    if (bitmap.GetPixel(x, y).A == 0) continue;
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }

            if (maxX < minX || maxY < minY) return Rectangle.Empty;
            return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
        }

        private void LoadTransferJson()
        {
            if (string.IsNullOrEmpty(rawAssetRoot)) return;

            string transferPath = Path.Combine(rawAssetRoot, "transfer.json");
            if (!File.Exists(transferPath)) return;

            string currentId = "";
            Regex idRegex = new Regex("^\\s*\"(\\d{4})\"\\s*:\\s*\\{");
            Regex nameRegex = new Regex("^\\s*\"name\"\\s*:\\s*\"([^\"]+)\"");

            foreach (string line in File.ReadAllLines(transferPath))
            {
                Match idMatch = idRegex.Match(line);
                if (idMatch.Success)
                {
                    currentId = idMatch.Groups[1].Value;
                    continue;
                }

                Match nameMatch = nameRegex.Match(line);
                if (nameMatch.Success && !string.IsNullOrEmpty(currentId))
                {
                    string name = nameMatch.Groups[1].Value.Replace("_", "");
                    if (!speciesToId.ContainsKey(name) && Directory.Exists(Path.Combine(rawAssetRoot, "Sprite", currentId)))
                    {
                        speciesToId[name] = currentId;
                    }
                }
            }
        }

        private void AddBuiltInSpeciesIds()
        {
            speciesToId["Bulbasaur"] = "0001";
            speciesToId["Charmander"] = "0004";
            speciesToId["Pikachu"] = "0025";
            speciesToId["Vulpix"] = "0037";
            speciesToId["Eevee"] = "0133";
            speciesToId["Chikorita"] = "0152";
            speciesToId["Treecko"] = "0252";
            speciesToId["Ralts"] = "0280";
            speciesToId["Shinx"] = "0403";
            speciesToId["Riolu"] = "0447";
            speciesToId["Sprigatito"] = "0906";
        }

        private string FindRawAssetRoot()
        {
            string env = Environment.GetEnvironmentVariable("EOL_RAW_ASSET_DIR");
            if (LooksLikeRawAsset(env)) return Path.GetFullPath(env);

            foreach (string start in GetSearchStarts())
            {
                string found = SearchUpward(start);
                if (!string.IsNullOrEmpty(found)) return found;
            }

            return "";
        }

        private IEnumerable<string> GetSearchStarts()
        {
            yield return Environment.CurrentDirectory;
            yield return AppDomain.CurrentDomain.BaseDirectory;
        }

        private string SearchUpward(string start)
        {
            if (string.IsNullOrEmpty(start)) return "";

            DirectoryInfo dir = new DirectoryInfo(start);
            for (int i = 0; i < 8 && dir != null; i += 1)
            {
                string candidate = Path.Combine(dir.FullName, "pmdo", "_downloads", "RawAsset");
                if (LooksLikeRawAsset(candidate)) return candidate;
                dir = dir.Parent;
            }

            return "";
        }

        private bool LooksLikeRawAsset(string path)
        {
            return !string.IsNullOrEmpty(path) &&
                   Directory.Exists(path) &&
                   Directory.Exists(Path.Combine(path, "Sprite")) &&
                   File.Exists(Path.Combine(path, "transfer.json"));
        }
    }
}
