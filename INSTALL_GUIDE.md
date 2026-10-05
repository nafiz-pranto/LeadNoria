# LeadNoria — Installation & Quick Start Guide

> **Discover. Verify. Connect.**  
> *Business lead research from real public signals.*

A simple, beginner-friendly guide to installing and using **LeadNoria** on Google Chrome (Windows, Mac, or Linux).

---

> ## ⚠️ CRITICAL INSTALLATION RULE
> **DO NOT select the ZIP file in Chrome's "Load unpacked" dialog.**
> 
> Google Chrome cannot read a `.zip` file directly. You **must extract (unzip) the file first** on your computer. Then, in Chrome, select the extracted folder that contains `manifest.json`.

---

## 📥 Part 1: How to Install LeadNoria (9 Simple Steps)

### STEP 1 — Download the Extension ZIP
Download `dist/leadnoria-v1.2.1.zip` (or `extension.zip`) from the release files to your computer (e.g. into your `Downloads` folder).

### STEP 2 — Extract / Unzip the ZIP File
Before doing anything in Chrome, unzip the downloaded file:
- **Windows**: Right-click the `.zip` file → click **Extract All...** → click **Extract**.
- **Mac**: Double-click the `.zip` file. Mac will instantly create an unzipped folder.
- **Linux**: Right-click the `.zip` file → click **Extract Here**.

### STEP 3 — Open Google Chrome
Open your Chrome browser on your computer.

### STEP 4 — Go to `chrome://extensions`
1. Click on the address bar at the very top of Chrome.
2. Type `chrome://extensions` and press **Enter**.
*(Or click the 3 dots menu in Chrome's top-right corner → **Extensions** → **Manage Extensions**).*

### STEP 5 — Turn On "Developer mode"
Look in the **top-right corner** of the Extensions page. Find the toggle switch labeled **Developer mode** and turn it **ON** (the toggle turns blue).

### STEP 6 — Click "Load unpacked"
In the **top-left corner** of the page, three buttons will appear. Click the **Load unpacked** button.

### STEP 7 — Select the Extracted Folder
1. A folder selection window will open.
2. Browse to the unzipped folder from Step 2.
3. Select the folder named **`extension`** (the folder that directly contains `manifest.json`).
4. Click **Select Folder** (Windows) or **Open** (Mac).
*(Remember: Never select the `.zip` file here; select the normal unzipped folder).*

### STEP 8 — Pin LeadNoria to Your Toolbar
1. Click the **Puzzle piece icon** (Extensions) in the top-right toolbar of Chrome.
2. Find **LeadNoria** in the list.
3. Click the **Pin icon** next to LeadNoria so it stays visible in your toolbar.

### STEP 9 — Confirm LeadNoria is Ready
You will see the LeadNoria icon in your Chrome toolbar. Click it to open the extension side panel or popup!

---

## 🚀 Part 2: How to Start Your First Research

LeadNoria automatically discovers and organizes active commercial advertisers and verifies target public websites:

1. **Open LeadNoria**: Click the LeadNoria icon in your Chrome toolbar.
2. **Choose Your Source**: Select **Meta Ad Library** (the active production source) or use manual website inputs.
3. **Choose Your Search Parameters**:
   - Pick an industry preset or enter custom keywords (e.g. `HVAC Services`, `SaaS`).
   - Select your target geographic country from the dropdown.
4. **Click Start Research**: LeadNoria begins research in a controlled background tab.
5. **Review Results**: View discovered leads, active ad counts, verified website links, public contact points, and qualification reason graphs.
6. **Filter & Select**: Filter by qualification status (`QUALIFIED`, `UNCERTAIN`), search keywords, and select leads.
7. **Export**: Click **CSV** for formula-hardened spreadsheet output or **JSON** for structured data.

---

## 🔄 Part 3: How to Update LeadNoria

When updating from a previous version (e.g. v1.2.0 or v1.1.0 to v1.2.1):
1. **Download the new release**: Download `dist/leadnoria-v1.2.1.zip`.
2. **Extract into your extension folder**: Unzip the package, replacing the files in your existing extension directory.
3. **Open Chrome Extensions**: Navigate to `chrome://extensions`.
4. **Click the Reload Button**: Click the circular **Reload** icon on the LeadNoria card.
5. **Verify Version**: Confirm the card displays **LeadNoria 1.2.1**.
6. **State Preservation**: Your previously saved research runs and candidate entities are stored in `chrome.storage.local` and remain preserved across updates.

---

## ⏪ Part 4: How to Roll Back to a Previous Release

If you need to roll back to a previous release candidate (e.g. v1.2.1 → v1.2.0):
1. **Locate the Previous Release ZIP**: In your repository's `dist/` directory, find `leadnoria-v1.2.0.zip`.
2. **Extract to a Clean Directory**: Extract `leadnoria-v1.2.0.zip` to a separate folder.
3. **Remove Current Version in Chrome**:
   - Go to `chrome://extensions`.
   - On the LeadNoria card, click **Remove**.
4. **Load Previous Version**:
   - Click **Load unpacked**.
   - Select the extracted `leadnoria-v1.2.0` folder.
5. **Data Backward Compatibility**:
   - Schema versioning is backward-compatible between v1.2.0 and v1.2.1.
   - Core research run state and candidate entities remain readable.
6. **Verify Rollback**: Ensure the extension card displays version `1.2.0` and opens without console errors.

---

## ❓ Frequently Asked Questions (Beginner FAQ)

### Where is the ZIP file?
The release file is named `leadnoria-v1.2.1.zip` (or `extension.zip`) in the release downloads or project `dist/` directory.

### How do I unzip it?
- On **Windows**: Right-click the `.zip` file and select **Extract All...**.
- On **Mac**: Double-click the `.zip` file.
- On **Linux**: Right-click and choose **Extract Here**.

### Which folder do I choose in Chrome?
Choose the extracted folder that directly contains the file `manifest.json`. When you open this folder on your computer, `manifest.json`, `app.js`, and `service-worker.js` are inside it.

### How do I know LeadNoria loaded correctly?
You will see a card titled **LeadNoria** (Version 1.2.1) on your `chrome://extensions` page with an active blue toggle switch and no red error badges.
