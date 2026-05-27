using System;
using System.Windows.Forms;

namespace ExplorersOfLegends
{
    internal static class Program
    {
        [STAThread]
        private static int Main(string[] args)
        {
            if (args.Length > 0 && args[0] == "--smoke-test")
            {
                return SmokeTest.Run();
            }
            if (args.Length > 1 && args[0] == "--render-title")
            {
                return RenderSnapshot.SaveTitle(args[1]);
            }
            if (args.Length > 2 && args[0] == "--render-scene")
            {
                return RenderSnapshot.SaveScene(args[1], args[2]);
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new GameForm());
            return 0;
        }
    }
}
