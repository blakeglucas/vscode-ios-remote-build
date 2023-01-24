# iOS Remote Build

## Features

TODO

## Requirements

- [iOS Remote Build Server](https://github.com/blakeglucas/ios-remote-build-server) running on a Mac computer
- [py-ios-device](https://github.com/YueChen-C/py-ios-device) installed and on the PATH (for automatic .ipa installation, if required)
- Yarn installed on both Host and Remote computers

## Extension Settings

This extension contributes the following settings:

- `ios-remote-build.remoteHost`: Remote Host running the iOS Remote Build Server application
- `ios-remote-build.remotePort`: Remote Port of the iOS Remote Build server

## Known Issues

- Fickle initial connection sometimes

## Release Notes

### 0.1.0

- Added synchronized workspaces so changes made to code on Windows syncs to Mac workspace and hot-reloads on iPhone
- Stabilized extension, code refactors

### 0.0.1

Initial development

## Why not just use Jenkins?

- I've always disliked development environments that are heavily GUI-dependent (Visual Studio, XCode, Eclipse, etc.). The only one of those that's been inescapable is XCode, so I wanted to figure out a way to build iOS apps purely in the command line anyway.
- I've always wanted to learn how to write VSCode extensions.
- I'd rather debug code than Jenkins, so this was more fun!
