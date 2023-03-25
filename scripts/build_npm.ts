import $ from "https://deno.land/x/dax@0.30.1/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

await emptyDir("./npm");

$.logStep("Building npm package...");
await build({
  entryPoints: ["mod.ts"],
  typeCheck: true,
  test: true,
  esModule: false,
  outDir: "./npm",
  shims: {
    deno: "dev",
  },
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
    devDependencies: {
      "@types/chai": "^4.2.22",
    },
  },
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");

// todo: this is temporary in order to get a regular `export =`
$.logStep("Updating output to use export = ...");
const npmDir = $.path(import.meta).parentOrThrow().parentOrThrow().join("npm");
const jsFile = npmDir.join("script/mod.js");
let jsFileText = jsFile.readTextSync();
jsFileText = jsFileText.replace(`Object.defineProperty(exports, "__esModule", { value: true });`, "");
jsFileText = jsFileText.replace(`exports.default = CodeBlockWriter;`, "module.exports = CodeBlockWriter;");
jsFile.writeTextSync(jsFileText);

const declFile = npmDir.join("types/mod.d.ts");
let declText = declFile.readTextSync();
declText = declText.replace("export default class ", "declare class ");
declText = declText + "\nexport = CodeBlockWriter";
declFile.writeTextSync(declText);

$.logStep("Rerunning tests...");
await $`npm run test`.cwd(npmDir);
$.logStep("Complete!");
