# GoDaddy Deployment Guide for KagPlus Website

This guide will help you publish your KagPlus website to your GoDaddy hosting.

## Prerequisites

- GoDaddy hosting account with cPanel access
- Your GoDaddy login credentials
- FTP client (FileZilla recommended) OR access to GoDaddy's File Manager

## Method 1: Using GoDaddy File Manager (Easiest)

### Step 1: Log into GoDaddy
1. Go to https://www.godaddy.com
2. Click "Sign In" at the top right
3. Enter your username and password

### Step 2: Access Your Hosting
1. Click on your account name (top right)
2. Select "My Products"
3. Find your Web Hosting product
4. Click "Manage" next to your hosting plan

### Step 3: Open cPanel
1. In your hosting dashboard, scroll down to find "cPanel Admin"
2. Click "cPanel Admin" to open the control panel

### Step 4: Access File Manager
1. In cPanel, scroll down to the "Files" section
2. Click on "File Manager"
3. Navigate to the `public_html` folder (this is your website's root directory)

### Step 5: Upload Your Files
1. In File Manager, make sure you're inside the `public_html` folder
2. Click "Upload" at the top menu
3. Click "Select File" and upload these files one by one:
   - `index.html`
   - `KagPlus logo_revised.png`
   - `SEO_IMPROVEMENTS.md` (optional - for reference only)

**Alternative: Upload as ZIP**
1. First, create a ZIP file of your website files on your computer
2. Upload the ZIP file to `public_html`
3. Right-click the ZIP file in File Manager
4. Select "Extract"
5. Delete the ZIP file after extraction

### Step 6: Set Permissions (if needed)
1. Right-click on `index.html`
2. Select "Change Permissions"
3. Set to 644 (read/write for owner, read for others)
4. Do the same for the image file

### Step 7: Test Your Website
1. Open your browser
2. Go to your domain name (e.g., https://yourdomain.com)
3. Your KagPlus website should now be live!

---

## Method 2: Using FTP (FileZilla)

### Step 1: Get Your FTP Credentials
1. Log into GoDaddy
2. Go to "My Products" → Your hosting plan → "Manage"
3. In cPanel, find "FTP Accounts" under the "Files" section
4. Note your FTP credentials:
   - **Server/Host**: Usually `ftp.yourdomain.com` or your domain name
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: 21 (standard FTP) or 22 (SFTP)

### Step 2: Download and Install FileZilla
1. Go to https://filezilla-project.org/
2. Download FileZilla Client (free)
3. Install it on your computer

### Step 3: Connect to Your GoDaddy Server
1. Open FileZilla
2. Enter your FTP credentials at the top:
   - **Host**: ftp.yourdomain.com
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: 21
3. Click "Quickconnect"

### Step 4: Navigate to public_html
1. On the right side (Remote site), navigate to the `public_html` folder
2. On the left side (Local site), navigate to your project folder:
   `/Users/kaylamariesarte/Documents/Study/kagplus`

### Step 5: Upload Files
1. Select these files from the left side:
   - `index.html`
   - `KagPlus logo_revised.png`
2. Right-click and select "Upload" OR drag them to the right side
3. Wait for the upload to complete

### Step 6: Verify Upload
1. Check that the files appear in the `public_html` folder on the right side
2. Visit your domain in a browser to test

---

## Method 3: Using Git (Advanced)

If your GoDaddy hosting supports SSH access:

### Step 1: Enable SSH Access
1. In cPanel, look for "SSH Access" or "Terminal"
2. Enable SSH if not already enabled
3. Note your SSH credentials

### Step 2: Connect via SSH
```bash
ssh username@yourdomain.com
```

### Step 3: Navigate to public_html
```bash
cd public_html
```

### Step 4: Clone Your Repository
```bash
git clone https://github.com/kmservices000/kagplus_main.git temp
mv temp/* .
rm -rf temp
```

### Step 5: Set Permissions
```bash
chmod 644 index.html
chmod 644 "KagPlus logo_revised.png"
```

---

## Troubleshooting

### Issue: "Index of /" showing instead of website
**Solution**: Make sure your file is named exactly `index.html` (lowercase) and is in the `public_html` folder.

### Issue: Images not loading
**Solution**: Check that:
- Image filename matches exactly in your HTML (case-sensitive)
- Image file uploaded successfully
- File permissions are set to 644

### Issue: Website shows old content
**Solution**:
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- Wait a few minutes for DNS propagation

### Issue: Can't connect via FTP
**Solution**:
- Check your firewall isn't blocking port 21
- Verify your FTP credentials
- Try SFTP (port 22) instead
- Contact GoDaddy support to ensure FTP is enabled

---

## Important Notes

1. **Backup**: Always backup existing files before uploading new ones
2. **File Names**: Keep filenames without spaces when possible (use hyphens or underscores)
3. **Case Sensitivity**: Linux servers are case-sensitive, so `Image.png` ≠ `image.png`
4. **DNS Propagation**: If using a new domain, it may take up to 48 hours to fully propagate
5. **HTTPS**: Consider enabling SSL certificate in GoDaddy for secure HTTPS access

---

## Next Steps After Publishing

1. **Test on Multiple Devices**: Check your website on mobile, tablet, and desktop
2. **Test on Multiple Browsers**: Chrome, Firefox, Safari, Edge
3. **Submit to Search Engines**:
   - Google Search Console: https://search.google.com/search-console
   - Bing Webmaster Tools: https://www.bing.com/webmasters
4. **Set up Google Analytics** for tracking visitors
5. **Monitor Performance**: Use Google PageSpeed Insights

---

## Getting Help

If you encounter issues:
1. **GoDaddy Support**: Available 24/7 via phone and chat
2. **GoDaddy Help Center**: https://www.godaddy.com/help
3. **Phone**: Check GoDaddy website for your region's support number

---

## Quick Reference: Your Files

Files to upload to `public_html`:
- ✅ `index.html` - Your main website file
- ✅ `KagPlus logo_revised.png` - Your logo
- ❌ `SEO_IMPROVEMENTS.md` - Keep this for reference only, don't need to upload
- ❌ `.DS_Store` - Don't upload (Mac system file)

---

**Your website will be live at**: `https://yourdomain.com`

(Replace `yourdomain.com` with your actual GoDaddy domain name)
