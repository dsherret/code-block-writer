
param (
  [Parameter(Mandatory=$true)]
  [string]$version
)

$ErrorActionPreference = "Stop"

if ((Get-Item (Get-Location)).FullName -ne (Get-Item $PSScriptRoot).Parent.FullName) {
  throw "Run this script from the repo's root directory.";
}

deno run --allow-read=./ --allow-write=./npm --allow-net --no-check https://deno.land/x/dnt@0.0.5/cli.ts -- `
  --config ./scripts/dnt.json `
  --packageVersion $version

# include license
copy LICENSE ./npm/LICENSE
