# Molt Bot (OpenClaw) for StockPilot

This setup allows you to control the **StockPilot** project development via **WhatsApp**.

## How it Works
1.  **Molt Bot** runs locally on your machine in this terminal.
2.  It connects to your **WhatsApp** account.
3.  It has access to the **StockPilot** project folder (`../../`).
4.  When you send a message like "Create a new component for the navbar" on WhatsApp, the bot will:
    *   Read the project files on your computer.
    *   Write/Edit code directly in the StockPilot project.
    *   Run commands (like `npm install` or tests) if requested.

## Setup Instructions

### 1. Install Dependencies
Open a terminal in this `moltbot` folder and run:
```bash
npm install
```

### 2. Connect WhatsApp
Run the login command and **scan the QR code** with your phone (WhatsApp > Linked Devices > Link a Device).

**PowerShell:**
```powershell
$env:OPENCLAW_STATE_DIR='.\data'; node node_modules\openclaw\dist\entry.js channels login
```

### 3. Start the Bot
Start the gateway. Keep this terminal **OPEN** and **RUNNING** for the bot to work.

**PowerShell:**
```powershell
$env:OPENCLAW_STATE_DIR='.\data'; node node_modules\openclaw\dist\entry.js gateway --port 18789
```

## How to Use
1.  Open WhatsApp on your phone.
2.  Find the chat with the bot (or your own number if you linked your main account).
3.  Send a command. Examples:
    *   "Check the `docs/requirements.md` file and tell me what to build next."
    *   "Create a new page `src/pages/Inventory.tsx` with a basic table."
    *   "Run `npm test` in the web folder."
    *   "What is the current status of the project?"

## Troubleshooting
*   **Bot not replying?** Check if the terminal is still running. If it crashed, restart it using the "Start the Bot" command.
*   **Changes not showing?** The bot edits files on your disk. If you have the files open in an editor (like VS Code or Trae), they should update automatically.
