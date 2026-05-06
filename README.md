# noyt

A small CLI to block YouTube system-wide.

I built this because browser extensions are easy to bypass and I kept ending up on YouTube anyway. This blocks it at the system level instead.


## Install

### Homebrew (recommended)

```bash
brew tap dankgarlic1/noyt && brew install noyt
```

## Usage

It's just:

```bash
sudo noyt
```

It works as a toggle:
- first run → blocks YouTube
- next run → unblocks

Run it again anytime to switch states.

## What it does

- adds entries to /etc/hosts
- blocks traffic via macOS firewall (pf)
- flushes DNS cache

Currently tested with:

- Chrome
- Brave



## Notes

- Requires sudo
- Restart your browser after running
- Blocking may take ~1–3 minutes to fully apply
- Some parts of YouTube may briefly load — that’s normal


## Transparency

This project is fully open source.

You can review the entire codebase before running anything:
  [github.com/dankgarlic1/noyt](https://github.com/dankgarlic1/noyt)



## ⚠️ Warning

This tool modifies system files:
- `/etc/hosts`
- macOS `pf` firewall rules

Use at your own discretion.
## Why this exists

Because “just don’t open YouTube” stops working the moment your brain wants dopamine.


## License

MIT