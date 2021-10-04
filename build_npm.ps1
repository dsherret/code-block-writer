$ErrorActionPreference = "Stop"

deno run --allow-read=./ --allow-write=./npm --allow-net --no-check https://deno.land/x/dnt@0.0.3/cli.ts `
   -- mod.ts `
   --typeCheck `
   --declaration `
   --outDir ./npm/dist `
   --removeComments `
   --esModuleInterop `
   --stripInternal `
   --target ES2015 `
   --module commonjs

# include license
copy LICENSE ./npm/LICENSE
