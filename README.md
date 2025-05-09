# Neuphonic Chrome Extension

A chrome extension that uses Neuphonic to read aloud highlighted text, or allows users to converse
with a page using Neuphonic Agents.

## Developing
 1. `git clone` the repo, then `cd neuphonic-chrome-extension`.
 2. `pnpm install` to install all dependencies.
 3. `pnpm build` to build the project. This will create the `/build` folder. Alternatively, you can
   use `pnpm dev` to start a watchdog that builds incrementally on change.
 4. Navigate to Chrome -> `chrome://extensions/` -> Toggle "Developer Mode" on (top right) ->
   "Load Unpacked" -> A file explorer will open. Select the `/build` folder.

You now have the chrome extension installed.
Navigate to any page, open the extension, add your API key, highlight any text and hit "Read Aloud".