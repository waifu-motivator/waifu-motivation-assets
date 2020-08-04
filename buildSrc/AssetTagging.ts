import path from 'path';
import fs from 'fs';
import {assetDirectories, rootDirectory, walkDir} from "./AssetTools";
import {values} from 'lodash';


console.log('Starting asset list generation.');

const scanDirectories = () => {
  console.log("Scanning asset directories");
  return assetDirectories.map(directory =>
    walkDir(path.join(rootDirectory, directory))
      .then((items: string[]) => {
        return {
          directory,
          items: items.filter(item => !(item.endsWith('.checksum.txt') || item.endsWith('assets.json')))
            .map(item => `${
              item.substring(__dirname.length).replace(/\\/g, '/')}`)
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

const generators: {
  [assetDirectory: string]: {
    generator: (assetPath: string) => any;
    idExtractor: (generatedItem: any) => string;
  }
} = {
  'visuals': {
    generator: (assetPath: string) => ({
      imagePath: assetPath,
      imageAlt: "",
    }),
    idExtractor: (item: any) => item.imagePath //todo: consolidate all the things to just be `path`
  },
};

function getAssetDefinitionGenerator({directory}: { directory: string; items: string[] }) {
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
      const newAssets = values([
        ...assetCategory.items.map(assetPath => ({
          ...generator(assetPath),
          categories: []
        })),
        ...assetList
      ].reduce((accum, next) => ({
        ...accum,
        [idExtractor(next)]: next
      }), {}));

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
