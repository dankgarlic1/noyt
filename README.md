# noyt

A small CLI to block YouTube system-wide.

I built this because browser extensions are easy to bypass and I kept ending up on YouTube anyway. This blocks it at the system level instead.

---

## Install

### Homebrew (recommended)

brew tap YOUR_USERNAME/noyt  
brew install noyt  

---

## Usage

First run (after install):

sudo noyt

After that, it's just:

sudo noyt

It works as a toggle:
- first run → blocks YouTube
- next run → unblocks

---

## What it does

- adds entries to /etc/hosts
- blocks traffic via macOS firewall (pf)
- flushes DNS cache

Works for Chrome and Brave currently

---

## Notes

- Requires sudo
- Restart your browser after running
- Blocking may take ~1–3 minutes to fully apply
- Some parts of YouTube may briefly load — that’s normal

---

## Transparency

This project is fully open source.

You can review the entire codebase before running anything:
👉 https://github.com/dankgarlic1/noyt


## ⚠️ Warning

This tool modifies system files:
- /etc/hosts
- macOS firewall (pf)

## Why this exists

Because “just don’t open YouTube” is a lie.


## License

MIT