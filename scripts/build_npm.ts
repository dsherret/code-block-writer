import { ensureDirSync, existsSync } from "https://deno.land/std@0.84.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.84.0/path/mod.ts";
import * as ts from "https://esm.sh/typescript@4.1.3";

// This is terrible for maintainability and only works in simple scenarios, but whatever.

const sourceFileCache = new Map<string, ts.SourceFile>();
const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2015,
    declaration: true,
    outDir: "./npm/dist",
    removeComments: true,
    esModuleInterop: true,
    stripInternal: true,
};
const program = ts.createProgram({
    rootNames: [
        "./mod.ts",
    ],
    options,
    host: {
        getSourceFile(filePath: string, languageVersion: ts.ScriptTarget) {
            let sourceFile = sourceFileCache.get(filePath);
            if (sourceFile == null) {
                sourceFile = ts.createSourceFile(filePath, this.readFile(filePath)!, languageVersion);
                sourceFileCache.set(filePath, sourceFile);
            }
            return sourceFile;
        },
        fileExists(filePath: string) {
            return existsSync(filePath);
        },
        readFile(filePath: string) {
            if (filePath.endsWith("scripts/lib.d.ts"))
                return `type Partial<T> = { [P in keyof T]?: T[P]; };`;
            return Deno.readTextFileSync(filePath);
        },
        writeFile(filePath: string, data: string) {
            ensureDirSync(path.dirname(filePath));
            console.log(filePath);
            Deno.writeTextFileSync(filePath, data);
        },
        getCurrentDirectory() {
            return Deno.cwd();
        },
        getCanonicalFileName(fileName: string) {
            return fileName;
        },
        useCaseSensitiveFileNames() {
            return true;
        },
        getNewLine() {
            return "\n";
        },
        getDefaultLibFileName(options) {
            return "./scripts/lib.d.ts";
        },
        resolveModuleNames(moduleNames, containingFile) {
            const resolvedModules: ts.ResolvedModule[] = [];

            for (const moduleName of moduleNames.map(removeTsExtension)) {
                const result = ts.resolveModuleName(moduleName, containingFile, options, this);
                if (result.resolvedModule)
                    resolvedModules.push(result.resolvedModule);
            }

            return resolvedModules;

            function removeTsExtension(moduleName: string) {
                if (moduleName.slice(-3).toLowerCase() === ".ts")
                    return moduleName.slice(0, -3);
                return moduleName;
            }
        },
    },
});

const result = program.emit(undefined, undefined, undefined, undefined, {
    before: [context => {
        // only bother visiting the source file children
        return (node: ts.SourceFile) => ts.visitEachChild(node, visitNode, context);

        function visitNode(node: ts.Node): ts.Node {
            if (ts.isImportDeclaration(node)) {
                if (ts.isStringLiteral(node.moduleSpecifier)) {
                    const newText = node.moduleSpecifier.text.replace(/\.ts$/, "");
                    return context.factory.updateImportDeclaration(
                        node,
                        node.decorators,
                        node.modifiers,
                        node.importClause,
                        context.factory.createStringLiteral(newText),
                    );
                }
            }
            return node;
        }
    }],
});

if (result.diagnostics.length > 0) {
    console.log(result.diagnostics);
    throw new Error("FAILED");
}

Deno.renameSync("./npm/dist/mod.js", "./npm/dist/code-block-writer.js");
Deno.renameSync("./npm/dist/mod.d.ts", "./npm/dist/code-block-writer.d.ts");
