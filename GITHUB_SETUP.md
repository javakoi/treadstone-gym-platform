# How to Move Treadstone Climbing to GitHub

Step-by-step guide to put your project on GitHub.

---

## Before You Start

**Important:** Your `.env.local` file contains secret keys (Supabase, etc.). It is already in `.gitignore` and will **not** be uploaded. Never commit secrets to GitHub.

---

## Step 1: Create a GitHub Account (if needed)

Go to [github.com](https://github.com) and sign up (free).

---

## Step 2: Create a New Repository on GitHub

1. Log in to GitHub
2. Click the **+** in the top-right → **New repository**
3. Name it (e.g. `treadstone-gym-platform` or `treadstone-climbing`)
4. Choose **Private** (recommended for business code) or **Public**
5. **Do not** check "Add a README" — you already have files
6. Click **Create repository**

---

## Step 3: Open Terminal and Go to Your Project

```bash
cd "/Users/andrewswitzer/Desktop/Treadstone Climbing"
```

---

## Step 4: Initialize Git (if not already)

```bash
git init
```

If you see "Reinitialized existing Git repository" or "Initialized empty Git repository", that's fine.

---

## Step 5: Add a Root .gitignore (Safety)

Make sure secrets and build files are never committed. Create or update `.gitignore` at the project root:

```bash
# Already exists in gym-platform; add at root if pushing whole folder
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "gym-platform/node_modules" >> .gitignore
echo "gym-platform/.next" >> .gitignore
```

Or create a `.gitignore` in the Treadstone Climbing folder with:

```
.env
.env.local
*.env.local
gym-platform/node_modules
gym-platform/.next
```

---

## Step 6: Add All Files and Commit

```bash
git add .
git status
```

Review the list. You should **not** see:
- `.env.local`
- `node_modules`
- `.next`

If you do, they're not ignored — fix `.gitignore` before committing.

```bash
git commit -m "Initial commit: Treadstone gym platform"
```

---

## Step 7: Connect to GitHub and Push

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/andrewswitzer/treadstone-gym-platform.git
git push -u origin main
```

---

## Step 8: Enter Credentials

GitHub may ask for login:

- **Username:** your GitHub username
- **Password:** use a **Personal Access Token** (not your GitHub password)
  - GitHub → Settings → Developer settings → Personal access tokens
  - Generate a token with `repo` scope
  - Use that token as the password

---

## Done

Your project is on GitHub. You can view it at:
`https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`

---

## Future Updates

When you make changes:

```bash
cd "/Users/andrewswitzer/Desktop/Treadstone Climbing"
git add .
git commit -m "Describe your changes"
git push
```

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `git status` | See what's changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save a snapshot |
| `git push` | Upload to GitHub |
