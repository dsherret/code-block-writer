import { Node, Project, ResolutionHosts, SourceFile, ts } from "https://deno.land/x/ts_morph@10.0.1/mod.ts";

const project = new Project({
  resolutionHost: ResolutionHosts.deno,
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    declaration: true,
    outDir: "./npm/dist",
    removeComments: true,
    esModuleInterop: true,
    stripInternal: true,
  },
});

// rename the entry point so it's more descriptive
const modSourceFile = project.addSourceFileAtPath("./mod.ts");
modSourceFile.move("./code-block-writer.ts");

// remove extensions from module specifiers
for (const sourceFile of project.getSourceFiles()) {
  stripExtensionsFromModuleSpecifiers(sourceFile);
}

// emit
const result = await project.emit();
const diagnostics = result.getDiagnostics();
if (diagnostics.length > 0) {
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
  throw new Error("FAILED");
}

// copy in the licence file
project.getFileSystem().copySync("./LICENSE", "./npm/LICENSE");

function stripExtensionsFromModuleSpecifiers(sourceFile: SourceFile) {
  for (const statement of sourceFile.getStatements()) {
    if (Node.isImportDeclaration(statement) || Node.isExportDeclaration(statement)) {
      const modSpecifierValue = statement.getModuleSpecifierValue();
      if (modSpecifierValue != null) {
        statement.setModuleSpecifier(modSpecifierValue.replace(/\.(ts|js)$/, ""));
      }
    }
  }
}
