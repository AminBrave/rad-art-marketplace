[CmdletBinding()]
param(
    [switch]$List
)

$ErrorActionPreference = "Stop"
$RepositoryRoot = Split-Path -Parent $PSScriptRoot
$TestId = "test_artwork_catalogue_resilience.ArtworkCatalogueResilienceTests.test_desktop_sticky_artwork_filter_sidebar_scrolls_when_content_overflows"

Push-Location $RepositoryRoot
try {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw "npm was not found. Install Node.js and ensure npm is on PATH."
    }

    if (-not (Test-Path "node_modules")) {
        throw "Frontend dependencies are missing. Run 'npm run setup' from the repository root first."
    }

    if ($List) {
        Write-Host "Listing browser tests and their database-safety classification..." -ForegroundColor Cyan
        & npm run test:browser -- --list
        if ($LASTEXITCODE -ne 0) {
            throw "Could not list browser tests (exit code $LASTEXITCODE)."
        }
        return
    }

    Write-Host "Running the focused desktop artwork-sidebar overflow test..." -ForegroundColor Cyan
    Write-Host "Target: $TestId"
    Write-Host "The app must already be running locally (npm run dev)." -ForegroundColor DarkGray

    & npm run test:browser -- $TestId
    if ($LASTEXITCODE -ne 0) {
        throw "Artwork sidebar browser test failed (exit code $LASTEXITCODE). See build/test-reports/browser/browser-run.log."
    }

    Write-Host "Artwork sidebar scroll test passed." -ForegroundColor Green
    Write-Host "JUnit report: build/test-reports/browser/browser-junit.xml"
    Write-Host "Run log:      build/test-reports/browser/browser-run.log"
}
finally {
    Pop-Location
}
