# Testing Local Images

## Quick Test Instructions

1. **Add a test image** to this folder:
   - Name it exactly as it appears in your Google Sheet
   - Example: If your sheet has "Virat Kohli", name the file `Virat Kohli.jpg`
   - Or try: `virat-kohli.jpg`, `virat_kohli.jpg`, or `viratkohli.jpg`

2. **Check the browser console** (F12) to see which image paths are being tried

3. **Verify the file path**:
   - The app looks for images at: `/images/players/[filename]`
   - In your file system, that's: `public/images/players/[filename]`
   - The `public` folder is served at the root `/` by Vite

## Common Issues:

- **File name doesn't match**: Check console logs to see what names are being tried
- **Wrong folder**: Make sure images are in `public/images/players/` (not `src/images/players/`)
- **Case sensitivity**: Try both uppercase and lowercase versions
- **File extension**: Make sure it's .jpg, .jpeg, .png, or .webp
- **Server needs restart**: After adding images, refresh the page (Ctrl+R or Cmd+R)

## Need Help?

Open the browser console (F12) and look for messages starting with:
- "Player: [name]"
- "Trying image candidates: [...]"
- "Successfully loaded image: ..." or "Image failed: ..."


