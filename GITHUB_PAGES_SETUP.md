# GitHub Pages Setup for kagplus.com

This guide will help you publish your KagPlus website at **https://kagplus.com** using FREE GitHub Pages hosting.

---

## Part 1: Enable GitHub Pages (On GitHub Website)

### Step 1: Go to Your Repository
1. Open your browser and go to: https://github.com/kmservices000/kagplus_main
2. Make sure you're logged into GitHub

### Step 2: Access Settings
1. Click the **"Settings"** tab (top menu of your repository)
2. In the left sidebar, scroll down and click **"Pages"** (under "Code and automation" section)

### Step 3: Enable GitHub Pages
1. Under **"Source"**, you'll see a dropdown that says "None"
2. Click the dropdown and select **"main"** (or "Deploy from a branch")
3. Make sure **"/ (root)"** is selected for the folder
4. Click **"Save"**

### Step 4: Wait for Deployment
1. GitHub will show a message: "Your site is ready to be published at..."
2. Wait 1-2 minutes for the initial deployment
3. Refresh the page - you should see: "Your site is live at https://kmservices000.github.io/kagplus_main/"
4. Click the link to verify your site is working

**✅ Checkpoint:** Your website should now be visible at `https://kmservices000.github.io/kagplus_main/`

---

## Part 2: Add Custom Domain in GitHub

### Step 1: Configure Custom Domain
1. Still in the **Pages** settings on GitHub
2. Find the **"Custom domain"** section
3. In the text box, type: `kagplus.com` (without www)
4. Click **"Save"**

### Step 2: Enable HTTPS (Optional but Recommended)
1. After saving, wait a minute
2. Check the box **"Enforce HTTPS"** (may need to wait for DNS to propagate first)

**✅ Checkpoint:** GitHub is now configured to serve your site at kagplus.com

---

## Part 3: Configure GoDaddy DNS Settings

Now we need to tell GoDaddy to point your domain to GitHub Pages.

### Step 1: Log into GoDaddy
1. Go to https://www.godaddy.com
2. Sign in to your account
3. Click your profile icon → **"My Products"**

### Step 2: Access DNS Management
1. Find your domain **kagplus.com** in the list
2. Click the **"DNS"** button next to it (or click the three dots → "Manage DNS")

### Step 3: Add A Records for GitHub Pages
You need to add 4 A records that point to GitHub's servers.

1. Scroll down to the **"Records"** section
2. Click **"Add"** button

**Add these 4 A Records one by one:**

**Record 1:**
- Type: `A`
- Name: `@`
- Value: `185.199.108.153`
- TTL: `600` seconds (or default)

**Record 2:**
- Type: `A`
- Name: `@`
- Value: `185.199.109.153`
- TTL: `600` seconds

**Record 3:**
- Type: `A`
- Name: `@`
- Value: `185.199.110.153`
- TTL: `600` seconds

**Record 4:**
- Type: `A`
- Name: `@`
- Value: `185.199.111.153`
- TTL: `600` seconds

### Step 4: Add CNAME Record for www subdomain
1. Click **"Add"** again
2. Add a CNAME record:
   - Type: `CNAME`
   - Name: `www`
   - Value: `kmservices000.github.io`
   - TTL: `600` seconds

### Step 5: Remove Conflicting Records (Important!)
Look for any existing A records or CNAME records that point to GoDaddy parking pages:
- If you see an A record with name `@` pointing to a different IP, **delete it**
- If you see a CNAME with name `@`, **delete it**
- Keep only the 4 GitHub A records and the www CNAME record

### Step 6: Save Changes
1. Click **"Save"** for each record
2. GoDaddy will show a warning about propagation time - that's normal

**✅ Checkpoint:** DNS settings are now configured

---

## Part 4: Wait and Verify

### DNS Propagation Time
- DNS changes can take **15 minutes to 48 hours** to fully propagate
- Usually it's much faster (15-30 minutes)

### How to Check if It's Working

**After 15-30 minutes:**

1. Open a new browser tab (or incognito/private window)
2. Go to: `https://kagplus.com`
3. Your KagPlus website should load!

**Also test:**
- `http://kagplus.com` (should redirect to https)
- `https://www.kagplus.com` (should also work)

### Troubleshooting

**Issue: "Site can't be reached" or DNS error**
- Solution: DNS hasn't propagated yet. Wait 30 minutes and try again.

**Issue: Shows GoDaddy parking page**
- Solution: Make sure you deleted the old A records in GoDaddy DNS
- Wait for DNS to propagate

**Issue: "Your connection is not private" SSL warning**
- Solution: Go back to GitHub Pages settings and enable "Enforce HTTPS"
- May need to wait for DNS to fully propagate first

**Issue: 404 Error from GitHub**
- Solution: Make sure custom domain is set to `kagplus.com` in GitHub Pages settings
- Check that `index.html` is in the root of your repository

### Check DNS Propagation Status
You can check if DNS has updated using these tools:
- https://www.whatsmydns.net/#A/kagplus.com
- Should show the 4 GitHub IP addresses

---

## Summary - What You Did

1. ✅ Enabled GitHub Pages on your repository
2. ✅ Set custom domain to `kagplus.com` in GitHub
3. ✅ Added 4 A records in GoDaddy DNS pointing to GitHub
4. ✅ Added www CNAME record
5. ✅ Removed conflicting DNS records

**Result:**
- Your website files are hosted FREE on GitHub Pages
- Your professional domain `kagplus.com` points to your site
- You get free SSL/HTTPS
- Automatic updates when you push to GitHub

---

## Future Updates

To update your website in the future:

### Method 1: Edit Files on GitHub
1. Go to your repository
2. Click on a file (e.g., `index.html`)
3. Click the pencil icon to edit
4. Make changes and commit
5. Changes go live automatically in 1-2 minutes

### Method 2: Update from Your Computer
```bash
cd /Users/kaylamariesarte/Documents/Study/kagplus
# Make your changes to files
git add .
git commit -m "Update website"
git push
```
Changes will be live in 1-2 minutes!

---

## Cost Breakdown

- GitHub Pages Hosting: **$0/month** ✅
- Your kagplus.com domain: **~$12-15/year** (what you already paid)
- SSL Certificate: **$0/month** (included free) ✅
- Bandwidth: **Unlimited** ✅

**Total monthly cost: $0** 🎉

You saved ~$5-10/month by using GitHub Pages instead of GoDaddy hosting!

---

## Need Help?

- GitHub Pages Documentation: https://docs.github.com/en/pages
- Check if your site is live: https://kagplus.com
- DNS Checker: https://www.whatsmydns.net

**Your website will be live at: https://kagplus.com**
