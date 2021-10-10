import { build } from "https://deno.land/x/dnt@0.0.9/mod.ts";

await build({
  entryPoint: "mod.ts",
  typeCheck: true,
  outDir: "./npm",
  package: {
    name: "code-block-writer",
    version: Deno.args[0] ?? "0.0.0",
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
