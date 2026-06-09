using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

namespace ExplorersOfLegends
{
    public sealed class SpriteAtlas : IDisposable
    {
        private const int SpriteSize = 24;
        private readonly Dictionary<string, Bitmap> tiles;
        private readonly Dictionary<string, Bitmap> itemSprites;
        private readonly Dictionary<string, Bitmap> creatureSprites;
        private readonly ExternalSpriteProvider externalSprites;

        public SpriteAtlas()
        {
            tiles = new Dictionary<string, Bitmap>();
            itemSprites = new Dictionary<string, Bitmap>();
            creatureSprites = new Dictionary<string, Bitmap>();
            externalSprites = new ExternalSpriteProvider();
        }

        public void Dispose()
        {
            DisposeAll(tiles);
            DisposeAll(itemSprites);
            DisposeAll(creatureSprites);
            externalSprites.Dispose();
        }

        public void DrawTile(Graphics g, string id, int x, int y, int size)
        {
            DrawBitmap(g, GetTile(id), new Rectangle(x, y, size, size));
        }

        public void DrawItem(Graphics g, string id, float centerX, float centerY, int size)
        {
            Rectangle dest = new Rectangle((int)(centerX - size / 2f), (int)(centerY - size / 2f), size, size);
            DrawBitmap(g, GetItem(id), dest);
        }

        public void DrawCreature(Graphics g, PokemonOption mon, float centerX, float centerY, int size)
        {
            if (mon == null) return;

            using (Brush shadow = new SolidBrush(Color.FromArgb(64, 23, 28, 38)))
            {
                g.FillRectangle(shadow, (int)(centerX - size * .34f), (int)(centerY + size * .29f), (int)(size * .68f), Math.Max(3, size / 8));
            }

            Bitmap external;
            if (externalSprites.TryGetCreature(mon, out external))
            {
                DrawBitmapFit(g, external, centerX, centerY, size);
                return;
            }

            Rectangle dest = new Rectangle((int)(centerX - size / 2f), (int)(centerY - size / 2f), size, size);
            string key = "mon:" + mon.Id + ":" + mon.Color.ToArgb() + ":" + mon.Accent.ToArgb();
            Bitmap sprite;
            if (!creatureSprites.TryGetValue(key, out sprite))
            {
                sprite = CreateCreature(mon);
                creatureSprites[key] = sprite;
            }
            DrawBitmap(g, sprite, dest);
        }

        private Bitmap GetTile(string id)
        {
            Bitmap bitmap;
            if (!tiles.TryGetValue(id, out bitmap))
            {
                bitmap = CreateTile(id);
                tiles[id] = bitmap;
            }
            return bitmap;
        }

        private Bitmap GetItem(string id)
        {
            Bitmap bitmap;
            if (!itemSprites.TryGetValue(id, out bitmap))
            {
                bitmap = CreateItem(id);
                itemSprites[id] = bitmap;
            }
            return bitmap;
        }

        private void DrawBitmap(Graphics g, Bitmap bitmap, Rectangle dest)
        {
            GraphicsState state = g.Save();
            g.InterpolationMode = InterpolationMode.NearestNeighbor;
            g.PixelOffsetMode = PixelOffsetMode.Half;
            g.SmoothingMode = SmoothingMode.None;
            g.DrawImage(bitmap, dest, 0, 0, bitmap.Width, bitmap.Height, GraphicsUnit.Pixel);
            g.Restore(state);
        }

        private void DrawBitmapFit(Graphics g, Bitmap bitmap, float centerX, float centerY, int size)
        {
            float scale = Math.Min(size / (float)bitmap.Width, size / (float)bitmap.Height);
            int width = Math.Max(1, (int)Math.Round(bitmap.Width * scale));
            int height = Math.Max(1, (int)Math.Round(bitmap.Height * scale));
            Rectangle dest = new Rectangle((int)Math.Round(centerX - width / 2f), (int)Math.Round(centerY - height / 2f), width, height);
            DrawBitmap(g, bitmap, dest);
        }

        private Bitmap CreateTile(string id)
        {
            Bitmap bitmap = NewBitmap();
            if (id == "grass")
            {
                Fill(bitmap, Color.FromArgb(255, 81, 176, 85));
                Rect(bitmap, 2, 6, 4, 2, Color.FromArgb(255, 64, 148, 70));
                Rect(bitmap, 13, 14, 5, 2, Color.FromArgb(255, 61, 145, 68));
                Rect(bitmap, 18, 5, 3, 2, Color.FromArgb(255, 113, 211, 104));
                Rect(bitmap, 7, 19, 6, 2, Color.FromArgb(255, 70, 156, 73));
            }
            else if (id == "grass_dark")
            {
                Fill(bitmap, Color.FromArgb(255, 65, 151, 74));
                Rect(bitmap, 2, 9, 5, 2, Color.FromArgb(255, 50, 126, 66));
                Rect(bitmap, 15, 17, 6, 2, Color.FromArgb(255, 50, 126, 66));
                Rect(bitmap, 18, 4, 3, 2, Color.FromArgb(255, 92, 184, 88));
            }
            else if (id == "path")
            {
                Fill(bitmap, Color.FromArgb(255, 211, 181, 116));
                Rect(bitmap, 3, 7, 4, 2, Color.FromArgb(255, 176, 141, 88));
                Rect(bitmap, 14, 14, 6, 2, Color.FromArgb(255, 187, 150, 93));
                Rect(bitmap, 9, 20, 3, 2, Color.FromArgb(255, 160, 126, 78));
            }
            else if (id == "cave_floor")
            {
                Fill(bitmap, Color.FromArgb(255, 169, 145, 102));
                Rect(bitmap, 3, 5, 5, 2, Color.FromArgb(255, 128, 105, 79));
                Rect(bitmap, 15, 9, 4, 2, Color.FromArgb(255, 198, 176, 129));
                Rect(bitmap, 8, 18, 8, 2, Color.FromArgb(255, 139, 113, 82));
            }
            else if (id == "cave_wall")
            {
                Fill(bitmap, Color.FromArgb(255, 72, 86, 103));
                Rect(bitmap, 0, 0, 24, 5, Color.FromArgb(255, 103, 119, 136));
                Rect(bitmap, 0, 20, 24, 4, Color.FromArgb(255, 44, 55, 72));
                Rect(bitmap, 3, 7, 7, 2, Color.FromArgb(255, 114, 130, 146));
                Rect(bitmap, 13, 12, 8, 2, Color.FromArgb(255, 49, 61, 79));
                Rect(bitmap, 8, 17, 3, 2, Color.FromArgb(255, 124, 139, 154));
            }
            else if (id == "water")
            {
                Fill(bitmap, Color.FromArgb(255, 61, 149, 215));
                Rect(bitmap, 0, 4, 8, 2, Color.FromArgb(255, 116, 197, 241));
                Rect(bitmap, 10, 13, 9, 2, Color.FromArgb(255, 41, 118, 190));
                Rect(bitmap, 16, 21, 7, 2, Color.FromArgb(255, 116, 197, 241));
            }
            else
            {
                Fill(bitmap, Color.Magenta);
            }
            return bitmap;
        }

        private Bitmap CreateItem(string id)
        {
            Bitmap bitmap = NewBitmap();
            if (id == "stairs")
            {
                Rect(bitmap, 7, 5, 10, 3, Color.FromArgb(255, 234, 246, 255));
                Rect(bitmap, 6, 8, 12, 3, Color.FromArgb(255, 80, 174, 235));
                Rect(bitmap, 5, 11, 14, 3, Color.FromArgb(255, 52, 132, 204));
                Rect(bitmap, 4, 14, 16, 4, Color.FromArgb(255, 38, 92, 169));
                Rect(bitmap, 3, 18, 18, 3, Color.FromArgb(255, 25, 62, 125));
            }
            else if (id == "apple")
            {
                Rect(bitmap, 10, 3, 4, 3, Color.FromArgb(255, 68, 124, 55));
                Rect(bitmap, 8, 7, 9, 2, Color.FromArgb(255, 250, 112, 70));
                Rect(bitmap, 6, 9, 13, 9, Color.FromArgb(255, 221, 58, 42));
                Rect(bitmap, 8, 18, 9, 3, Color.FromArgb(255, 151, 43, 35));
                Rect(bitmap, 8, 10, 3, 3, Color.FromArgb(255, 255, 174, 121));
            }
            else if (id == "badge")
            {
                Rect(bitmap, 10, 3, 4, 3, Color.FromArgb(255, 255, 255, 221));
                Rect(bitmap, 7, 6, 10, 3, Color.FromArgb(255, 255, 224, 73));
                Rect(bitmap, 5, 9, 14, 8, Color.FromArgb(255, 229, 168, 41));
                Rect(bitmap, 8, 17, 8, 4, Color.FromArgb(255, 145, 93, 30));
                Rect(bitmap, 9, 10, 6, 5, Color.FromArgb(255, 255, 248, 188));
            }
            return bitmap;
        }

        private Bitmap CreateCreature(PokemonOption mon)
        {
            Bitmap bitmap = NewBitmap();
            string id = mon.Id == null ? "" : mon.Id.ToLowerInvariant();
            Color outline = Color.FromArgb(255, 35, 44, 57);
            Color light = Lighten(mon.Color, 42);
            Color dark = Darken(mon.Color, 38);

            if (id == "restless" || id == "shinx")
            {
                Rect(bitmap, 7, 6, 4, 7, outline);
                Rect(bitmap, 14, 6, 4, 7, outline);
                Rect(bitmap, 8, 7, 2, 6, mon.Accent);
                Rect(bitmap, 15, 7, 2, 6, mon.Accent);
                Rect(bitmap, 6, 11, 13, 9, outline);
                Rect(bitmap, 7, 10, 11, 9, mon.Color);
                Rect(bitmap, 9, 14, 2, 2, outline);
                Rect(bitmap, 15, 14, 2, 2, outline);
                Rect(bitmap, 18, 13, 3, 2, outline);
                Rect(bitmap, 20, 11, 2, 6, mon.Accent);
                Rect(bitmap, 6, 20, 4, 2, dark);
                Rect(bitmap, 15, 20, 4, 2, dark);
            }
            else if (id == "brave" || id == "vulpix")
            {
                Rect(bitmap, 8, 6, 9, 12, outline);
                Rect(bitmap, 9, 5, 7, 12, mon.Color);
                Rect(bitmap, 11, 9, 2, 2, outline);
                Rect(bitmap, 16, 9, 2, 2, outline);
                Rect(bitmap, 6, 17, 12, 5, dark);
                Rect(bitmap, 17, 13, 3, 3, outline);
                Rect(bitmap, 19, 11, 3, 3, Color.FromArgb(255, 255, 221, 64));
                Rect(bitmap, 20, 9, 2, 2, Color.FromArgb(255, 249, 89, 37));
            }
            else if (id == "lonely" || id == "eevee")
            {
                Rect(bitmap, 5, 5, 5, 7, outline);
                Rect(bitmap, 15, 5, 5, 7, outline);
                Rect(bitmap, 6, 6, 3, 5, mon.Color);
                Rect(bitmap, 16, 6, 3, 5, mon.Color);
                Rect(bitmap, 6, 11, 13, 9, outline);
                Rect(bitmap, 7, 10, 11, 8, mon.Color);
                Rect(bitmap, 8, 17, 10, 4, Color.FromArgb(255, 244, 224, 175));
                Rect(bitmap, 9, 14, 2, 2, outline);
                Rect(bitmap, 15, 14, 2, 2, outline);
            }
            else if (id == "riolu")
            {
                Rect(bitmap, 6, 4, 4, 7, outline);
                Rect(bitmap, 15, 4, 4, 7, outline);
                Rect(bitmap, 7, 11, 12, 9, outline);
                Rect(bitmap, 8, 10, 10, 8, mon.Color);
                Rect(bitmap, 7, 16, 5, 4, mon.Accent);
                Rect(bitmap, 14, 16, 5, 4, mon.Accent);
                Rect(bitmap, 10, 13, 2, 2, outline);
                Rect(bitmap, 15, 13, 2, 2, outline);
                Rect(bitmap, 11, 18, 5, 3, Color.FromArgb(255, 237, 211, 127));
            }
            else if (id == "gentle" || id == "steady" || id == "sprigatito")
            {
                Rect(bitmap, 11, 2, 3, 8, mon.Accent);
                Rect(bitmap, 8, 4, 8, 4, Lighten(mon.Accent, 24));
                Rect(bitmap, 5, 11, 14, 8, outline);
                Rect(bitmap, 6, 10, 12, 8, mon.Color);
                Rect(bitmap, 7, 18, 4, 3, dark);
                Rect(bitmap, 15, 18, 4, 3, dark);
                Rect(bitmap, 9, 13, 2, 2, outline);
                Rect(bitmap, 15, 13, 2, 2, outline);
                Rect(bitmap, 8, 9, 4, 2, light);
            }
            else if (id == "clever")
            {
                Rect(bitmap, 8, 7, 9, 11, outline);
                Rect(bitmap, 9, 6, 7, 10, mon.Color);
                Rect(bitmap, 5, 15, 6, 3, dark);
                Rect(bitmap, 16, 16, 5, 2, mon.Accent);
                Rect(bitmap, 9, 10, 2, 2, outline);
                Rect(bitmap, 15, 10, 2, 2, outline);
                Rect(bitmap, 8, 18, 11, 3, mon.Accent);
            }
            else if (id == "ralts")
            {
                Rect(bitmap, 6, 7, 13, 6, mon.Accent);
                Rect(bitmap, 5, 10, 15, 4, outline);
                Rect(bitmap, 7, 11, 11, 4, mon.Accent);
                Rect(bitmap, 9, 14, 7, 8, Color.FromArgb(255, 242, 247, 235));
                Rect(bitmap, 11, 12, 2, 2, outline);
            }
            else
            {
                Rect(bitmap, 6, 8, 13, 11, outline);
                Rect(bitmap, 7, 7, 11, 11, mon.Color);
                Rect(bitmap, 8, 18, 4, 3, dark);
                Rect(bitmap, 15, 18, 4, 3, dark);
                Rect(bitmap, 9, 12, 2, 2, outline);
                Rect(bitmap, 15, 12, 2, 2, outline);
                Rect(bitmap, 10, 8, 5, 2, light);
            }

            return bitmap;
        }

        private static Bitmap NewBitmap()
        {
            Bitmap bitmap = new Bitmap(SpriteSize, SpriteSize, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.Clear(Color.Transparent);
            }
            return bitmap;
        }

        private static void Fill(Bitmap bitmap, Color color)
        {
            using (Graphics g = Graphics.FromImage(bitmap))
            using (Brush brush = new SolidBrush(color))
            {
                g.FillRectangle(brush, 0, 0, bitmap.Width, bitmap.Height);
            }
        }

        private static void Rect(Bitmap bitmap, int x, int y, int w, int h, Color color)
        {
            using (Graphics g = Graphics.FromImage(bitmap))
            using (Brush brush = new SolidBrush(color))
            {
                g.FillRectangle(brush, x, y, w, h);
            }
        }

        private static Color Lighten(Color color, int amount)
        {
            return Color.FromArgb(color.A, Clamp(color.R + amount), Clamp(color.G + amount), Clamp(color.B + amount));
        }

        private static Color Darken(Color color, int amount)
        {
            return Color.FromArgb(color.A, Clamp(color.R - amount), Clamp(color.G - amount), Clamp(color.B - amount));
        }

        private static int Clamp(int value)
        {
            if (value < 0) return 0;
            if (value > 255) return 255;
            return value;
        }

        private static void DisposeAll(Dictionary<string, Bitmap> bitmaps)
        {
            foreach (Bitmap bitmap in bitmaps.Values)
            {
                bitmap.Dispose();
            }
            bitmaps.Clear();
        }
    }
}
