import * as tf from '@tensorflow/tfjs';

const INPUT_SHAPE = [1920, 1080, 3];
const OUTPUT_SHAPE = [ // Always in the 0..1 range
  4 * 2 /* corner coordinates (X and Y): top left, top right, bottom right, bottom left */ +
  1 /* codel size in pixels, once untransformed */
];

export function newModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({inputShape: INPUT_SHAPE, units: 64, activation: 'relu'}),
      tf.layers.dense({units: OUTPUT_SHAPE[0], activation: 'sigmoid'}),
    ]
  });
  model.compile({
    optimizer: 'sgd',
    loss: 'meanSquaredError',
    metrics: ['accuracy']
  });
  return model;
}
