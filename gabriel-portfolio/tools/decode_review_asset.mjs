/** Decode our Meshopt/WebP GLBs for Blender's plain glTF importer. */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize,textureCompress} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import sharp from 'sharp';
const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('input and output paths required');
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const doc=await io.read(input);await doc.transform(dequantize(),textureCompress({encoder:sharp,targetFormat:'png'}));for(const ext of doc.getRoot().listExtensionsUsed())if(['EXT_meshopt_compression','EXT_texture_webp'].includes(ext.extensionName))ext.dispose();await io.write(output,doc);
