# AnimeStream

## Current State
Empty workspace -- full regeneration requested.

## Requested Changes (Diff)

### Add
- Full anime streaming website inspired by Crunchyroll
- Dark theme (black background, orange accents), premium look
- Homepage with hero banner (background video support via URL or file upload)
- Anime card grid with custom thumbnails, title, description, play overlay
- Video player with full controls (play/pause, 10s skip, seek bar, volume, fullscreen)
- Admin panel (password: ayanbhai07682) for content management
- Add/Edit/Delete anime with thumbnail via URL or file upload
- Site settings: name, logo, hero background video, full website background (color/image/video)
- Video upload up to 1 hour with progress bar
- localStorage for anime data and settings persistence
- Animations: parallax hero, floating particles, staggered card entrance, navbar transparency

### Modify
- N/A (fresh build)

### Remove
- N/A

## Implementation Plan
1. Generate Motoko backend with blob storage for file uploads
2. Build React frontend with all pages/sections
3. Wire authorization for admin panel
4. Implement all upload, player, and admin features
