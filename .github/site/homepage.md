# Ghostbird: GhostText for Thunderbird

[![Supports Thunderbird ESR](https://img.shields.io/badge/supports-Thunderbird_140_ESR-0a84ff?logo=thunderbird&logoSize=auto)][tb]
[![Latest release](https://img.shields.io/github/v/release/exteditor/ghostbird?include_prereleases&logo=refinedgithub&logoColor=white&logoSize=auto)][rels]

[![Download on AMO](https://raw.githubusercontent.com/thunderbird/webext-support/refs/heads/master/images/get-the-addon.svg)](#installation)

Ghostbird is an Thunderbird add-on that lets you compose your emails in your favorite text editor - Vim, Neovim, VS Code, Sublime Text, Emacs, or any other editor with a GhostText add-on installed.

## Requirements

* [Thunderbird 140][tb] (We will mainly support the latest ESR)
* A text editor that has a GhostText server add-on installed and running:

  [![Sublime Text][sublimetext-svg]](https://sublime.wbond.net/packages/GhostText)
  [<img width="48" height="48" alt="VSCodium" title="VSCodium" src="https://raw.githubusercontent.com/VSCodium/vscodium.github.io/refs/heads/master/img/codium_cnl.svg" >](https://open-vsx.org/extension/fregante/ghost-text)
  [![Visual Studio Code][vscode-svg]](https://marketplace.visualstudio.com/items?itemName=fregante.ghost-text)
  [![GNU Emacs][emacs-svg]](https://melpa.org/#/atomic-chrome)
  [![Vim][vim-svg]][vimghost]
  [![Neovim][nvim-svg]](https://github.com/subnut/nvim-ghost.nvim)
  [<img src="https://9fans.github.io/plan9port/dist/spaceglenda100.png" width="48" height="48" alt="Acme" title="Acme">](https://github.com/fhs/Ghost)
  [<img src="https://github.com/user-attachments/assets/b0ca34ed-5508-458f-b7af-2642824bf7f7" width="48" height="48" alt="Helix" title="Helix">][helix]
  [`$ANY_EDITOR`](https://github.com/newsch/GhostText-Any/)

  The last two implementations can wrap any editor that blocks while editing.

## Installation

[<img src="./ext/blue.svg" width="48" height="48" border="1" align="right" alt="logo" title="Grey-headed bushshrike (Malaconotus blanchoti) is sometimes called 'ghostbird'">][bird]

* See [the help page in the Mozilla Support Center](https://support.mozilla.org/kb/installing-addon-thunderbird) for details.

You can install Ghostbird in several ways:

### Install within Thunderbird (Recommended)

1. In Thunderbird, open `Add-ons Manager`.
2. Search for "Ghostbird".
3. Click the <kbd>+ Add to Thunderbird</kbd> button.

### Download and install manually

1. Download the latest release from the [Thunderbird add-on website][amo] or [GitHub Releases][rels].
2. In Thunderbird, go to `Add-ons Manager`.
3. Drag and drop the downloaded `.xpi` file into the `Add-ons Manager` window.

Alternatively, you can:

3. Press :gear: button at the top-right.
4. Select `Install Add-on From File...` from the menu.
5. Select downloaded `.xpi` file.

### Build from source

* Basically, running `make` will do, which is roughly equivalent to `yarn install && yarn build`.
* See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## Usage

1. Launch your favorite text editor.
2. Start the GhostText server in your text editor (e.g., with `:GhostTextStart` in Vim).
3. Press the gray Ghostbird button <img alt="Gray button" src="./ext/gray.svg" width="24" height="24" border="1"> in the Thunderbird mail compose window. (The default shortcut is <kbd>^Ctrl</kbd>+<kbd>⇧Shift</kbd>+<kbd>H</kbd>)
   * If the connection is successful, the button will turn blue <img alt="Blue button" src="./ext/blue.svg" width="24" height="24" border="1">.
   * If the connection fails, the button will turn red <img alt="Red button" src="./ext/red.svg" width="24" height="24" border="1">. Make sure that the GhostText server is listening. See [Troubleshooting page of original GhostText](https://ghosttext.fregante.com/troubleshooting/#unable-to-connect).
4. Write your email in the text editor.
5. Close your text editor to stop Ghostbird.

* Example using [Vim-Ghost][vimghost]

  [vimghost.webm](https://github.com/user-attachments/assets/150ef991-10b8-45e2-bb2c-690f1b45a7ea)

* Example using Notepad++ via GhostText-Any

  <img width="600" height="302" alt="Screenshot using Notepad++ with GhostText-Any" src="https://github.com/user-attachments/assets/a4f92beb-a6f2-4a67-ae94-aa02af64539e" />

## How it works

* See [design.md](./doc/design.md) for details.

## Roadmap

* See [README.md](./README.md).
* See also [a list of milestones][milestones].

## Contributing

If you like the idea, please:

* [Star the repo](https://github.com/exteditor/ghostbird/#repository-container-header).
* [Rate the add-on][review].
* Feel free to open issues and submit pull requests. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.
* See our [milestones page][milestones] or [issues](https://github.com/exteditor/ghostbird/issues) for tasks you can contribute to, and use the [Discussions](https://github.com/exteditor/ghostbird/discussions) page for general discussions.

## FAQ

### Is it safe to use?

* I'd say yes, but save your work frequently since it may contain bugs and eat your email.
* This add-on does not collect any personal data and can only connect to localhost. Attempts to send any data to external servers are blocked by Thunderbird's security model.
* You can look inside the released `.xpi` files (which are just zip files) to verify that they match the build from the source code.
* As for trustworthiness, the safest option is to wait until it reaches 1.0.0, as that indicates it has passed Mozilla's manual review.

### Why not just fork the original GhostText add-on, or contribute to it?

* See [faq.md](./doc/faq.md#why).

### How do I set up a development environment?

* See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on the development workflow.

### How do I troubleshoot connection issues?

* Make sure that the GhostText server is listening. See the [Troubleshooting page of original GhostText](https://ghosttext.fregante.com/troubleshooting/#unable-to-connect).

### How do I switch between HTML mode and Plain Text mode?

* See [doc/faq.md](./doc/faq.md#mode).

### How can I support the project?

Please consider the following options:

* [Star the repo](https://github.com/exteditor/ghostbird/#repository-container-header)
* [Rate the add-on][review]
* [Donate to Thunderbird](https://www.thunderbird.net/en-US/donate/) (It's financially separate from Firefox)
* [Donate to @fregante, the author of the original GhostText](https://github.com/sponsors/fregante)
* [Contribute to the development](./CONTRIBUTING.md)

If you've looked at the options above and still want to motivate the maintainer [@snipsnipsnip](https://github.com/snipsnipsnip) specifically, you can tip some [ETH](https://gist.githubusercontent.com/snipsnipsnip/d0b0bd12045060c8f71fbc9ea936d886/raw/a840747caa6cac61d0bd3b59145e6ed7e9daf14f/eth.json).

## Credits

* [Federico Brigante](https://fregante.com/), the author of [GhostText][gt].
* [Alexandre Feblot](https://github.com/afeblot), the original author of [External Editor](https://github.com/exteditor/exteditor/), which I took over maintaining; it is now in a stale state. I intend to incorporate some of its features into Ghostbird.
* The button image is based on a [photo](https://commons.wikimedia.org/wiki/File:Grey-headed_Bushshrike_(Malaconotus_blanchoti)_in_tree,_crop.jpg) of a [Grey-headed Bushshrike][bird] by [Patty McGann](https://www.flickr.com/photos/10374910@N08/3093177192/) (CC-BY-2.0).

[proj]: https://github.com/exteditor/ghostbird/projects
[milestones]: https://github.com/exteditor/ghostbird/milestones
[tb]: https://www.thunderbird.net/download/esr/
[gt]: https://ghosttext.fregante.com/
[helix]: https://github.com/rahji/helix-ghost
[rels]: https://github.com/exteditor/ghostbird/releases
[sublimetext-svg]: ./doc/res/sublimetext.svg
[vscode-svg]: ./doc/res/vscode.svg
[emacs-svg]: ./doc/res/emacs.svg
[vim-svg]: ./doc/res/vim.svg
[nvim-svg]: ./doc/res/nvim.svg
[bird]: https://en.wikipedia.org/wiki/Grey-headed_bushshrike
[amo]: https://addons.thunderbird.net/addon/ghostbird/
[vimghost]: https://github.com/raghur/vim-ghost
[review]: https://addons.thunderbird.net/en-US/thunderbird/addon/ghostbird/reviews/add
