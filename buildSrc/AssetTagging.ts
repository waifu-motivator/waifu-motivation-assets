import path from 'path';
import fs from 'fs';
import {assetDirectories, rootDirectory, walkDir} from "./AssetTools";
import {values} from 'lodash';
import {imageSize} from 'image-size';


console.log('Starting asset list generation.');

const scanDirectories = () => {
  console.log("Scanning asset directories");
  return assetDirectories.map(directory =>
    walkDir(path.join(rootDirectory, directory))
      .then((items: string[]) => {
        return {
          directory,
          assets: items.filter(item => !(item.endsWith('.checksum.txt') || item.endsWith('assets.json')))
            .map(item => ({
              fullPath: item,
              relativePath: `${
                item.substring(__dirname.length).replace(/\\/g, '/')}`
            }))
        };
      })
  );
};

function readPreviousAssets(directory: string) {
  const assetsJson = path.resolve(__dirname, '..', directory, 'assets.json');
  if(fs.existsSync(assetsJson)){
    return {
      assetListPath: assetsJson,
      assetList: JSON.parse(fs.readFileSync(assetsJson, {encoding: 'utf-8'}))
    };
  }

  return {
    assetListPath: assetsJson,
    assetList: []
  };
}

type AssetDefinition = {
  fullPath: string;
  relativePath: string;
};

function getDimensions(fullPath: string) {
  const {height, width} = imageSize(fullPath);
  return {
    width,
    height
  };
}

const generators: {
  [assetDirectory: string]: {
    generator: (assetDefinition: AssetDefinition) => any;
    idExtractor: (generatedItem: any) => string;
  }
} = {
  'audible': {
    generator: ({relativePath}: AssetDefinition) => ({
      path: relativePath,
      categories:[],
    }),
    idExtractor: (item: any) => item.path //todo: consolidate all the things to just be `path`

  },
  'visuals': {
    generator: ({fullPath, relativePath}: AssetDefinition) => ({
      imagePath: relativePath, // todo: remove once plugin migrated.
      path: relativePath,
      imageAlt: "",
      imageDimensions: getDimensions(fullPath),
      categories:[],
    }),
    idExtractor: (item: any) => item.path //todo: consolidate all the things to just be `path`
  },
};

function getAssetDefinitionGenerator({directory}: { directory: string; assets: AssetDefinition[] }) {
  return generators[directory];
}

Promise.all(
  scanDirectories()
)
  .then(allAssets => {
    allAssets.forEach(assetCategory => {
      const {
        assetList,
        assetListPath
      } = readPreviousAssets(assetCategory.directory);

      const {
        generator,
        idExtractor
      } = getAssetDefinitionGenerator(assetCategory);

      const dictionaryReducer = (accum: any, next: any) => ({
        ...accum,
        [idExtractor(next)]: next
      });

      const previousAssetsById = assetList.reduce(dictionaryReducer, {});

      const newAssets = values([
        ...assetCategory.assets.map(assetPath => {
          const assetAttributes = generator(assetPath);
          const previousAsset = previousAssetsById[idExtractor(assetAttributes)];
          return ({
            ...assetAttributes,
            ...previousAsset,
          });
        }),
      ].reduce(dictionaryReducer, {}));

      fs.writeFileSync(assetListPath, JSON.stringify(
        newAssets, null, 2
      ), {
        encoding: 'utf-8'
      });
    });
  })
  .then(() => {
    console.log('Asset lists generated!');
  });
