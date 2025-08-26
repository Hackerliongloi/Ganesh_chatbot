# Ganesh Chaturthi • AI Chatbot

 single‑page chatbot that shares Ganesha‑inspired teachings, with an integrated **Smart Mode** that uses a OpenAI API.

## Files
- `index.html` — App entry point.
- `style.css` — Theme and layout (light/dark).
- `app.js` — Chat logic (Blessing Mode + optional Smart Mode).
- `assets/ganesha.svg` — Icon/logo.



## Quick Start (Laptop)
1) Open Folder
2) Double‑click `index.html` to open it in Chrome, Edge, Firefox, or Safari.
3) Type your prayer/worry/question and press **Enter**.
4) by default , smart mode is enabled , u can continue to chat

### Alternative: Run a local server (Python 3)
```bash
# from the folder
python -m http.server 8000
# then visit http://localhost:8000
```

## Android Phone
**No install needed:** copy the folder to your phone, then open `index.html` in Chrome/Firefox.  
Tip: Tap ⋮ → *Add to Home screen* to keep it as an app shortcut.  
Optional Smart Mode also works on mobile if you have an API key.

## iPhone/iPad
Open `index.html` in Safari, then share → *Add to Home Screen*.

## Privacy
All Blessing Mode chats stay in your browser via `localStorage`.  
by default Smart Mode is enabled, your messages are sent to OpenAI's API.

## License
MIT — use, modify, and share.
