# 🚀 Quick Start: First Run Checklist

## Prerequisites Check
- [ ] Node.js 18+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Git installed (optional): `git --version`
- [ ] ~1GB free disk space

## Step-by-Step First Run

### 1️⃣ Install Dependencies (5 min)
```bash
cd /home/zrain/Project/Acropad/electron
npm run install-deps
```
**What it does:**
- Installs Electron, React, Express to root
- Installs backend dependencies
- Installs frontend dependencies

**Expected output**: "up to date" or packages being added

---

### 2️⃣ Start Backend (Terminal 1)
```bash
cd /home/zrain/Project/Acropad/electron
npm run backend
```

**Expected output:**
```
Acropad Backend running on http://localhost:5000
```

✅ If you see this → Backend is working!

---

### 3️⃣ Start Frontend Dev Server (Terminal 2)
```bash
cd /home/zrain/Project/Acropad/electron
npm run frontend
```

**Expected output:**
```
Compiled successfully!
You can now view acropad-frontend in the browser.
Local: http://localhost:3000
```

✅ If you see this → Frontend is ready!

---

### 4️⃣ Launch Electron App (Terminal 3)
```bash
cd /home/zrain/Project/Acropad/electron
npm start
```

**Expected output:**
```
Starting Acropad...
```

✅ If an app window opens → SUCCESS! 🎉

---

## 🧪 First Test: Create & Edit Note

1. **Click "Add New Note"** in left sidebar
   - Expected: New file created (Untitled-[timestamp].md)
   - File should appear in file list

2. **Type in editor**:
   ```markdown
   # Test Note
   
   This is a **bold** test.
   
   ## Section 2
   
   - Item 1
   - Item 2
   
   $E = mc^2$
   ```

3. **Check preview** on the right
   - Markdown should render in real-time
   - Bold text should be formatted
   - LaTeX formula should appear

4. **Wait 2 seconds**
   - File should auto-save
   - Check that note file exists in notes/ directory

---

## ✅ Success Indicators

- [ ] Backend running (port 5000)
- [ ] Frontend dev server (port 3000)
- [ ] Electron window opened
- [ ] Can create new note
- [ ] Can type in editor
- [ ] Preview updates in real-time
- [ ] File saved to disk

---

## ❌ If Something Goes Wrong

### Backend won't start
```bash
# Check dependencies
cd electron/backend
npm install
npm start
```

### Frontend won't start
```bash
# Check dependencies
cd electron/frontend
npm install
npm start
```

### Electron won't open
```bash
# Check if backend is running
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

### Can't create notes
- Check permissions in `electron/` directory
- Ensure notes/ folder exists

### Preview not updating
- Open DevTools: Right-click in Electron window → Inspect
- Check Console for errors
- Verify backend is responding

---

## 📊 Port Checklist

| Service | Port | Check | Expected |
|---------|------|-------|----------|
| Backend | 5000 | `curl http://localhost:5000/api/health` | `{"status":"ok"}` |
| Frontend | 3000 | Browser: `http://localhost:3000` | React app loads |
| Electron | n/a | Window title | "Acropad" |

---

## 🎯 Common Issues & Fixes

### Issue: "Port 5000 already in use"
```bash
# Find process using port 5000
lsof -i :5000
# Kill it (replace PID with actual)
kill -9 <PID>
```

### Issue: "Cannot find module 'express'"
```bash
cd electron/backend
npm install express
```

### Issue: "React won't start"
```bash
cd electron/frontend
npm cache clean --force
rm -rf node_modules
npm install
npm start
```

### Issue: "Electron can't find files"
```bash
# Ensure this directory exists
mkdir -p /home/zrain/Project/Acropad/electron/notes
```

---

## 📝 Next Actions After First Run

1. **Test all features**:
   - [ ] Create multiple notes
   - [ ] Search files (if implemented)
   - [ ] Check auto-save works
   - [ ] Test keyboard shortcuts

2. **Read documentation**:
   - [ ] `electron/README.md` - Architecture
   - [ ] `COMPATIBILITY_ANALYSIS.md` - Technical details
   - [ ] `GEMINI_CLI_FEATURE_GUIDE.md` - Feature list

3. **Implement features**:
   - [ ] Pick task from Priority 1
   - [ ] Implement using Gemini CLI or manually
   - [ ] Test thoroughly

---

## 🎓 Quick Command Reference

```bash
# Development
npm run dev              # Start all (backend + frontend)
npm run backend          # Backend only
npm run frontend         # Frontend only  
npm start               # Electron app only

# Building
npm run build           # Create installers

# Testing
npm test                # Run tests

# Cleanup
rm -rf node_modules     # Remove dependencies
npm cache clean --force # Clear npm cache
```

---

## 📞 Getting Help

**Backend errors?** Check `electron/backend/server.js`  
**Frontend errors?** Check browser console (F12)  
**Electron errors?** Check Electron DevTools (right-click)  
**API errors?** Check `electron/backend/routes/`

---

## ⏱️ Estimated Timeline

| Step | Time | Notes |
|------|------|-------|
| Install deps | 5 min | First time only |
| Start backend | 10 sec | Ongoing |
| Start frontend | 30 sec | Ongoing |
| Launch Electron | 2 sec | Ongoing |
| First test | 2 min | Create note + edit |
| **Total** | **~8 min** | First run only |

---

## 🎉 You're Done!

If all checkboxes are complete, your Acropad Electron app is running! 

**Next Steps**:
1. Read GEMINI_CLI_FEATURE_GUIDE.md
2. Pick a Priority 1 task
3. Implement the feature
4. Test and iterate

Happy coding! 🚀

---

**Created**: January 24, 2026  
**For**: Acropad Electron Migration
**Location**: `/home/zrain/Project/Acropad/electron/`
