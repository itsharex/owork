# Owork Installation Guide

Owork is a desktop AI Agent application built on the Claude Agent SDK, supporting the creation, management, and interaction with AI Agents.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
  - [1. Install Owork](#1-install-owork)
  - [2. Configure API](#2-configure-api)
- [Optional: Configure Feishu Channel](#3-configure-feishu-channel)
- [Verify Installation](#verify-installation)
- [FAQ](#faq)

---

## System Requirements

| Item | Requirement |
|------|-------------|
| Operating System | macOS 10.15+, Windows 10/11, or Linux (Ubuntu 20.04+) |
| Processor | x86_64 or ARM64 (Apple Silicon) |
| Memory | 8GB RAM (16GB recommended) |
| Disk Space | 500MB available space |
| Network | Internet connection required |

---

## Installation Steps

### 1. Install Owork

#### macOS

**Option 1: Using DMG Installer (Recommended)**

1. Download [`Owork_x.x.x_aarch64.dmg`](https://d1a1de1i2hajk1.cloudfront.net/owork/release/v0.0.81/Owork_0.0.81_aarch64.dmg)
2. Double-click to open the DMG file
3. Drag `Owork.app` to the `Applications` folder
4. Launch Owork from Launchpad or the Applications folder

**First Launch Notes:**

macOS may block unsigned applications from running. If you encounter the "Cannot open Owork because the developer cannot be verified" prompt:

1. Open "System Preferences" → "Security & Privacy"
2. Click the "General" tab
3. Click "Open Anyway"

Or use the terminal command:
```bash
xattr -cr /Applications/Owork.app
```

#### Windows

**Option 1: Using MSI Installer (Recommended)**

1. Download the `Owork_x.x.x_x64.msi` installer
2. Double-click to run the installer
3. Follow the wizard to complete installation (default path: `C:\Program Files\Owork\`)
4. Launch Owork from the Start menu

**Option 2: Using NSIS Installer**

1. Download [`Owork_x.x.x._x64-setup.zip`](https://d1a1de1i2hajk1.cloudfront.net/owork/release/v0.0.81/Owork_0.0.81_x64-setup.zip)
2. Run the installer and follow the prompts
3. Launch Owork from the Start menu or desktop shortcut

**First Launch Notes:**

Windows may display a SmartScreen warning. Click "More info" → "Run anyway".

Git Bash system dependency is required: https://git-scm.com/downloads/win

#### Build from Source (All Platforms)

```bash
# Clone the repository
git clone https://github.com/xiehust/owork.git
cd owork/desktop

# Install dependencies
npm install

# Build the application (automatically detects current platform)
npm run build:all

# Build output located at ./src-tauri/target/release/bundle/
# macOS: dmg/Owork_x.x.x_aarch64.dmg or macos/Owork.app
# Windows: msi/Owork_x.x.x_x64.msi or nsis/Owork_x.x.x_x64-setup.exe
# Linux: deb/owork_x.x.x_amd64.deb or appimage/owork_x.x.x_x86_64.AppImage
```

---

### 2. Configure API

After launching Owork, you need to configure the API to use AI features.

#### Access the Settings Page

1. Launch Owork
2. Click the "Settings" icon (gear icon) in the left sidebar
3. Configure the API in the "API Configuration" section

#### Option 1: Using Litellm Proxy API

1. Create a proxy using [litellm gateway](https://docs.litellm.ai/docs/simple_proxy).
   - Make sure the "Use AWS Bedrock" toggle is turned off
   - Enter the proxy URL in the Base URL field
   - Paste your API Key in the "API Key" input field
   - Click "Save API Configuration"
   - Note: When configuring the lite config yml file, you need to set model_name to the official Claude Model Name, for example:
```yml
model_list:
  - model_name: claude-sonnet-4-5-20250929
    litellm_params:
      model: bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0
```

#### Option 2: Using an Open-Source AWS Production Proxy Solution

1. Use [Anthropic-Bedrock API Proxy](https://github.com/xiehust/anthropic_api_converter)
2. Deployed on AWS ECS, supports API Key management, budget allocation, traffic control, etc. Automatically maps official model IDs to Bedrock model IDs by default
![alt text](./assets/image-2p.png)

#### Option 3: Using AWS Bedrock (Not directly accessible from China and Hong Kong regions)

1. Ensure you have an AWS account with Bedrock service enabled
2. Request Claude model access permissions in the AWS Console
3. In Owork settings:
   - Enable the "Use AWS Bedrock" toggle
   - Choose authentication method:
     - **AK/SK Credentials**: Enter Access Key ID and Secret Access Key
     - **Bearer Token**: Enter Bearer Token
   - Select AWS Region
   - Click "Save API Configuration"

---

## 3. Configure Feishu Channel

### Step 1: Create a Feishu Application

1. Open the Feishu Open Platform
Visit the **Feishu Open Platform** and log in with your Feishu account.
For Lark (international version), use https://open.larksuite.com/app and set domain: "lark" in the configuration.

2. Create an Application
- Click **Create Custom App**
- Fill in the application name and description
- Choose an application icon
- Create the custom app

3. Get Application Credentials
- On the application's **Credentials and Basic Info** page, copy:
- App ID (format: cli_xxx)
- App Secret
❗ Important: Keep the App Secret safe and do not share it with others.

4. Configure Application Permissions
- On the **Permission Management** page, click the **Batch Import** button and paste the following JSON to import all required permissions:
```json
{
  "scopes": {
    "tenant": [
      "aily:file:read",
      "aily:file:write",
      "application:application.app_message_stats.overview:readonly",
      "application:application:self_manage",
      "application:bot.menu:write",
      "cardkit:card:write",
      "contact:user.employee_id:readonly",
      "corehr:file:download",
      "docs:document.content:read",
      "event:ip_list",
      "im:chat",
      "im:chat.access_event.bot_p2p_chat:read",
      "im:chat.members:bot_access",
      "im:message",
      "im:message.group_at_msg:readonly",
      "im:message.group_msg",
      "im:message.p2p_msg:readonly",
      "im:message:readonly",
      "im:message:send_as_bot",
      "im:resource",
      "sheets:spreadsheet",
      "wiki:wiki:readonly"
    ],
    "user": ["aily:file:read", "aily:file:write", "im:chat.access_event.bot_p2p_chat:read"]
  }
}
```

5. Enable Bot Capability
- On the **App Capabilities > Bot** page:
- Enable bot capability
- Configure the bot name

6. Configure Event Subscription
⚠️ Important: Before configuring event subscriptions, make sure you have completed the following:
- Owork is successfully running
- On the Event Subscription page:
- Select "Use long connection to receive events" (WebSocket mode)
- Add event: im.message.receive_v1 (Receive messages)
⚠️ Note: If the gateway is not started or the channel is not added, the long connection setup will fail.

7. Publish the Application
- Create a version on the **Version Management & Release** page
- Submit for review and publish
- Wait for admin approval (custom enterprise apps are usually auto-approved)

## Verify Installation

### Check Settings Page Status

Open the Owork Settings page and verify the following:

| Item | Expected Status |
|------|-----------------|
| Claude Code CLI - Status | ✓ Installed |
| Claude Code CLI - Node.js | ✓ Available |
| Claude Code CLI - npm | ✓ Available |
| Backend Service - Status | ● Running |
| API Configuration | Configured (showing ✓ Configured) |


## Add Plugins
On the **Plugin Management** page, click the **Install Plugin** button and enter the plugin's GitHub repo URL. Recommended official plugins:
| Name | URL |
|------|-----|
| Cowork knowledge-work-plugins | https://github.com/anthropics/knowledge-work-plugins.git |
| Official SKILL | https://github.com/anthropics/skills.git |
| Official PLUGINS | https://github.com/anthropics/claude-plugins-official.git |

## Add MCP
On the **MCP Management** page, click the **Add MCP Server** button, select the Connection Type. For example, to add AWS Knowledge, select HTTP and enter the URL https://knowledge-mcp.global.api.aws



### Test Agent Chat

1. Create a new Agent on the "Agents" page — you can customize which skills, MCP servers, and plugins to enable
2. Go to the "Chat" page
3. Select the Agent you just created
4. Send a test message, such as "Hello, how are you?"
5. If you receive an AI response, the installation was successful

---

## Data Storage Locations

Owork's data storage location varies by operating system:

### macOS

| Type | Path |
|------|------|
| Data Directory | `~/Library/Application Support/Owork/` |
| Database | `~/Library/Application Support/Owork/data.db` |
| Skills Directory | `~/Library/Application Support/Owork/skills/` |
| Logs Directory | `~/Library/Application Support/Owork/logs/` |

**View Logs:**
```bash
cat ~/Library/Application\ Support/Owork/logs/backend.log
```

### Windows

| Type | Path |
|------|------|
| Data Directory | `%LOCALAPPDATA%\Owork\` |
| Database | `%LOCALAPPDATA%\Owork\data.db` |
| Skills Directory | `%LOCALAPPDATA%\Owork\skills\` |
| Logs Directory | `%LOCALAPPDATA%\Owork\logs\` |

Typically located at: `C:\Users\YourUsername\AppData\Local\Owork\`

**View Logs:**
```powershell
# PowerShell
Get-Content $env:LOCALAPPDATA\Owork\logs\backend.log

# Or open with Notepad
notepad $env:LOCALAPPDATA\Owork\logs\backend.log
```

### Linux

| Type | Path |
|------|------|
| Data Directory | `~/.local/share/owork/` |
| Database | `~/.local/share/owork/data.db` |
| Skills Directory | `~/.local/share/owork/skills/` |
| Logs Directory | `~/.local/share/owork/logs/` |

**View Logs:**
```bash
cat ~/.local/share/owork/logs/backend.log
```

---

## FAQ

### Q: Backend Service shows Stopped after launch?

**A:** This is usually a timing issue — wait a few seconds and the status will automatically update to Running. If it persists:

1. Check the log file:
   ```bash
   cat ~/Library/Application\ Support/Owork/logs/backend.log
   ```
2. Try restarting the application

### Q: Claude Code CLI shows Not Found?

**A:** Make sure Node.js is properly installed:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Reinstall Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

### Q: "Unable to connect to backend service" when saving API configuration?

**A:** This may be a CORS or port issue:

1. Confirm that Backend Service shows as Running
2. Note the displayed port number
3. Test the connection in the terminal:
   ```bash
   curl http://localhost:<port>/health
   ```
4. If it returns `{"status":"healthy"...}`, try restarting the application

### Q: How to completely uninstall Owork?

**A (macOS):**

```bash
# 1. Delete the application
rm -rf /Applications/Owork.app

# 2. Delete data directory (optional, will delete all data)
rm -rf ~/Library/Application\ Support/Owork/

# 3. Uninstall Claude Code CLI (optional)
npm uninstall -g @anthropic-ai/claude-code
```

**A (Windows):**

```powershell
# 1. Uninstall via Windows Settings
# "Settings" → "Apps" → "Owork" → "Uninstall"

# Or uninstall via MSI (if installed with MSI)
# Control Panel → Programs and Features → Owork → Uninstall

# 2. Delete data directory (optional, will delete all data)
Remove-Item -Recurse -Force $env:LOCALAPPDATA\Owork

# 3. Uninstall Claude Code CLI (optional)
npm uninstall -g @anthropic-ai/claude-code
```

**A (Linux):**

```bash
# 1. Uninstall the application
# DEB installation:
sudo apt remove owork

# AppImage: simply delete the file
rm owork_*.AppImage

# 2. Delete data directory (optional, will delete all data)
rm -rf ~/.local/share/owork/

# 3. Uninstall Claude Code CLI (optional)
npm uninstall -g @anthropic-ai/claude-code
```

### Q: How to update Owork?

**A:**

1. Download the new version installer
2. Close the running Owork application
3. Drag the new version to the Applications folder and replace the old version
4. Restart Owork

Data is automatically preserved — no reconfiguration needed.

---

## Getting Help

- **GitHub Issues**: [Report issues or suggestions](https://github.com/xiehust/owork/issues)
- **Documentation**: See the project README and CLAUDE.md for more information

---

*Last updated: January 2025*
