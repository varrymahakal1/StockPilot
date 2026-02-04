@echo off
rem OpenClaw Gateway (v2026.2.1)
set PATH=C:\Users\Varun Mahakal\Documents\trae_projects\Stockpilot\moltbot\node_modules\.bin;c:\\Users\\Varun Mahakal\\.trae\\tools\\trae-gopls\\current;c:\\Users\\Varun Mahakal\\.trae\\sdks\\workspaces\\8265f6bb\\versions\\node\\current;c:\\Users\\Varun Mahakal\\.trae\\sdks\\versions\\node\\current;c:\Users\Varun Mahakal\.trae\tools\trae-gopls\current;c:\Users\Varun Mahakal\.trae\sdks\workspaces\8265f6bb\versions\node\current;c:\Users\Varun Mahakal\.trae\sdks\versions\node\current;C:\Program Files (x86)\Microsoft\Edge\Application;C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin;C:\Python313\Scripts\;C:\Python313\;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\WINDOWS\System32\OpenSSH\;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\Program Files\NVIDIA Corporation\NVIDIA NvDLISR;C:\Program Files\dotnet\;C:\Program Files\nodejs\;C:\ProgramData\chocolatey\bin;C:\Program Files\Git\cmd;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Windows\System32\OpenSSH\;C:\cloudeflared;C:\Users\Varun Mahakal\AppData\Local\Microsoft\WindowsApps;C:\Users\Varun Mahakal\AppData\Roaming\npm;C:\Users\Varun Mahakal\AppData\Local\Programs\Microsoft VS Code\bin;C:\cloudeflared";C:\Users\Varun Mahakal\.lmstudio\bin;C:\Users\Varun Mahakal\AppData\Local\Programs\cursor\resources\app\bin
set OPENCLAW_STATE_DIR=.\data
set OPENCLAW_GATEWAY_PORT=18789
set OPENCLAW_GATEWAY_TOKEN=b7a2a3a313bbbd01e241bb754df4785d01108c7e0f0d2eac
set OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service
set OPENCLAW_SERVICE_MARKER=openclaw
set OPENCLAW_SERVICE_KIND=gateway
set OPENCLAW_SERVICE_VERSION=2026.2.1
"C:\Program Files\nodejs\node.exe" "C:\Users\Varun Mahakal\Documents\trae_projects\Stockpilot\moltbot\node_modules\openclaw\dist\index.js" gateway --port 18789
