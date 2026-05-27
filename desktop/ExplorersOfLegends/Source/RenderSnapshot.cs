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
            try
            {
                GameState state = new GameState();
                state.Scene = SceneKind.Title;
                state.Clock = 1.25f;

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
    }
}
