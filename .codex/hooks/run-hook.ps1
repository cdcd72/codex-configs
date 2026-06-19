param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$ScriptName
)

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath $ScriptName

if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    Write-Error "Hook script not found: $scriptPath"
    exit 1
}

$inputJson = [Console]::In.ReadToEnd()

if ([string]::IsNullOrWhiteSpace($inputJson)) {
    & node $scriptPath
    exit $LASTEXITCODE
}

$inputJson | & node $scriptPath
exit $LASTEXITCODE
