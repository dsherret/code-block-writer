import { build, emptyDir } from "https://raw.githubusercontent.com/denoland/dnt/eec75130560bcf2fe7cf562c06e91dcd423fa519/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["mod.ts"],
  typeCheck: true,
  test: true,
  esModule: true,
  outDir: "./npm",
  shims: {
    deno: "dev",
  },
  declaration: "inline",
  package: {
    name: "code-block-writer",
    version: Deno.args[0],
    description: "A simple code writer that assists with formatting and visualizing blocks of code.",
    repository: {
      type: "git",
      url: "git+https://github.com/dsherret/code-block-writer.git",
    },
    keywords: [
      "code generation",
      "typescript",
      "writer",
      "printer",
    ],
    author: "David Sherret",
    license: "MIT",
    bugs: {
      url: "https://github.com/dsherret/code-block-writer/issues",
    },
    homepage: "https://github.com/dsherret/code-block-writer#readme",
  },
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
