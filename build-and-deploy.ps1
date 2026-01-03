# ============================================================================
# Next.js 14 Medical Chatbot - Complete Build & Deploy Script
# For Windows PowerShell 5.1+
# ============================================================================

param(
    [switch]$Deploy,
    [switch]$Clean,
    [switch]$NoCache
)

# ============================================================================
# Configuration
# ============================================================================

$ProjectPath = Split-Path -Parent $MyInvocation.MyCommandPath
$StartTime = Get-Date
$Colors = @{
    Title   = "Cyan"
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Gray"
    Step    = "Magenta"
}

function Write-Step {
    param([string]$Message, [string]$Number)
    Write-Host "`n$Number. $Message" -ForegroundColor $Colors.Step -BackgroundColor Black
    Write-Host ("=" * 70) -ForegroundColor $Colors.Step
}

function Write-Info {
    param([string]$Message)
    Write-Host "   $Message" -ForegroundColor $Colors.Info
}

function Write-Success {
    param([string]$Message)
    Write-Host "   ✓ $Message" -ForegroundColor $Colors.Success
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "   ✗ $Message" -ForegroundColor $Colors.Error
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "   ⚠ $Message" -ForegroundColor $Colors.Warning
}

# ============================================================================
# Main Script
# ============================================================================

Clear-Host
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Next.js 14 Medical Chatbot - Build & Deploy Pipeline       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Set-Location $ProjectPath
Write-Info "Project Path: $ProjectPath"

# ============================================================================
# Step 1: Validate Environment
# ============================================================================

Write-Step "Validating Environment" "1"

# Check Node.js
try {
    $NodeVersion = node --version
    Write-Success "Node.js installed: $NodeVersion"
} catch {
    Write-Error-Custom "Node.js not found. Please install Node.js 18+"
    exit 1
}

# Check npm
try {
    $NpmVersion = npm --version
    Write-Success "npm installed: $NpmVersion"
} catch {
    Write-Error-Custom "npm not found"
    exit 1
}

# Check Git (for deployment)
if ($Deploy) {
    try {
        $GitVersion = git --version
        Write-Success "Git installed: $GitVersion"
    } catch {
        Write-Error-Custom "Git not found. Required for deployment"
        exit 1
    }
}

# ============================================================================
# Step 2: Clean Build Artifacts
# ============================================================================

Write-Step "Cleaning Build Artifacts" "2"

# Kill Node processes
Write-Info "Killing Node.js processes..."
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 1
Write-Success "Node.js processes terminated"

# Remove .next folder
if (Test-Path ".next") {
    Write-Info "Removing .next folder..."
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Success ".next folder removed"
} else {
    Write-Info ".next folder not found (already clean)"
}

# Remove node_modules cache
if (Test-Path "node_modules\.cache") {
    Write-Info "Removing npm cache..."
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Success "npm cache removed"
}

# ============================================================================
# Step 3: Clean npm Cache (Optional)
# ============================================================================

if ($NoCache) {
    Write-Step "Clearing npm Cache" "3"
    Write-Info "Running: npm cache clean --force"
    npm cache clean --force
    Write-Success "npm cache cleared"
    $StepNumber = "4"
} else {
    Write-Info "(Skipping npm cache clean. Use -NoCache flag to force)"
    $StepNumber = "3"
}

# ============================================================================
# Step 4: Install Dependencies
# ============================================================================

Write-Step "Installing Dependencies" $StepNumber

Write-Info "Running: npm install --legacy-peer-deps"
Write-Info "(This may take 1-2 minutes on first run...)"

$InstallStart = Get-Date
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "npm install failed with exit code $LASTEXITCODE"
    exit 1
}

$InstallEnd = Get-Date
$InstallTime = [math]::Round(($InstallEnd - $InstallStart).TotalSeconds, 2)
Write-Success "Dependencies installed in $InstallTime seconds"

# ============================================================================
# Step 5: Type Check
# ============================================================================

Write-Step "TypeScript Type Checking" "5"

Write-Info "Running: npm run type-check"
npm run type-check

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Type checking failed"
    exit 1
}

Write-Success "All TypeScript types verified"

# ============================================================================
# Step 6: Build Project
# ============================================================================

Write-Step "Building Next.js Project" "6"

Write-Info "Running: npm run build"
Write-Info "This may take 2-5 minutes..."

$BuildStart = Get-Date
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Build failed with exit code $LASTEXITCODE"
    Write-Warning-Custom "Check errors above for details"
    exit 1
}

$BuildEnd = Get-Date
$BuildTime = [math]::Round(($BuildEnd - $BuildStart).TotalSeconds, 2)
Write-Success "Build completed successfully in $BuildTime seconds"

# ============================================================================
# Step 7: Verify Build Output
# ============================================================================

Write-Step "Verifying Build Output" "7"

if (-not (Test-Path ".next")) {
    Write-Error-Custom ".next folder not found after build"
    exit 1
}

Write-Success ".next folder verified"

# Calculate build size
$BuildSize = Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum
$SizeMB = [math]::Round($BuildSize.Sum / 1MB, 2)
Write-Info "Build size: $SizeMB MB"

# ============================================================================
# Step 8: Summary
# ============================================================================

Write-Step "Build Summary" "8"

$TotalTime = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 2)

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                     ✓ BUILD SUCCESSFUL                           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Info "Total time: $TotalTime seconds"
Write-Info "Build size: $SizeMB MB"
Write-Info "Output directory: ./.next"
Write-Info ""
Write-Info "Next steps:"
Write-Info "  • Local test: npm run start"
Write-Info "  • Development: npm run dev"

if ($Deploy) {
    Write-Info "  • Deploy: Follow Vercel deployment steps below"
}

# ============================================================================
# Step 9: Deployment Instructions (Optional)
# ============================================================================

if ($Deploy) {
    Write-Step "Preparing for Vercel Deployment" "9"
    
    Write-Info "Git Status:"
    git status
    
    Write-Info "`nDeployment Checklist:"
    Write-Info "  [ ] Verify git status is clean"
    Write-Info "  [ ] Environment variables set in Vercel dashboard:"
    Write-Info "      - GEMINI_API_KEY"
    Write-Info "  [ ] Vercel project created"
    Write-Info "  [ ] Build settings configured:"
    Write-Info "      Build Command: npm run build"
    Write-Info "      Output Directory: .next"
    Write-Info "      Install Command: npm install --legacy-peer-deps"
    
    Write-Host "`n" -ForegroundColor Yellow
    Write-Warning-Custom "Push to GitHub and deploy from Vercel dashboard"
    Write-Warning-Custom "OR use: vercel deploy --prod"
}

# ============================================================================
# Completion
# ============================================================================

Write-Host "`n" -ForegroundColor Cyan
Write-Host "✓ Script completed successfully!" -ForegroundColor Green
Write-Host "  Build time: $TotalTime seconds" -ForegroundColor Gray
Write-Host "  Status: Ready for deployment" -ForegroundColor Gray
Write-Host ""
