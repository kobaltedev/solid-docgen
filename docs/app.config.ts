import { withSolidBase } from "@kobalte/solidbase/config";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig(withSolidBase(
  {},
  {
    title: "Solid-Docgen",
    description: "Documentation for Solid-Docgen",
    themeConfig: {
      nav: [
        {
          text: "Docs",
          link: "/guide",
        },
        {
          text: "Playground",
          link: "/playground",
        },
      ],
      sidebar: {
        "/guide": {
          items: [
            {
              title: "Overview",
              collapsed: false,
              items: [
                {
                  title: "About",
                  link: "/",
                },
                {
                  title: "Getting Started",
                  link: "/getting-started",
                },
              ],
            },
          ],
        },
      },
    },
  }
));
