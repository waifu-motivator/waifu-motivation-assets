# Deprecated!!

This project has been replaced by the [Asset Management UI](https://github.com/waifu-motivator/waifu-asset-management-ui).

**Please use that project to manage our waifu!**


Waifu Motivation Assets
---

![Reina Hibike](https://waifu.assets.unthrottled.io/visuals/happy/reina_hibike.gif)

## Prerequisites

- [Yarn Package Manager](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
- `ts-node` installed globally (run `yarn global add ts-node`)


## First time setup

1. Run `yarn install` to get all teh goodies
1. Run `yarn download` to sync your local machine with all of the current assets.

## Usage

### Adding Assets

Just add assets to the directories defined in `AssetTools`.
 
### Uploading Assets

1. Be sure to do a `git pull` to update the assets download before uploading to avoid overwriting changed assets
    - If you did a `pull` and you got changes in the `syncedAssets.json` please run `yarn download` before continuing, and update accordingly.
1. Run `yarn build:asset-lists` to generate the `assets.json` with the items you added.
1. Run `yarn upload` to send them to the cloud!

### Blacklisting Assets

Some assets may have been uploaded that we don't want to appear anymore.

1. Move the entry from `syncedAssets.json` to `blacklistedAssets.json`.
1. Remove the asset from the appropriate `asset.json` file.
1. Run `yarn upload` to publish changes.

### Grouped Assets

You can group assets for an alert context. Just add a `groupId` property with UUID value (we're currently using UUID v4).

For example:
audible:
```json
  {
    "path": "...",
    "categories": ["..."],
    "groupId": "6ae8f9cd-c7b6-4f6a-964b-8252e4135e4f"
  }
```

visual:
```json
  {
    "imagePath": "...",
    "path": "...",
    "imageAlt": "",
    "imageDimensions": {},
    "categories": ["..."],
    "groupId": "6ae8f9cd-c7b6-4f6a-964b-8252e4135e4f"
  }
```
_Note: Both `audible ` and `visual ` assets contain the same `"groupId": "6ae8f9cd-c7b6-4f6a-964b-8252e4135e4f"` value._

Be sure to commit your changes so we all can be in sync!
