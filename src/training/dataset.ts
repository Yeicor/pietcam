import * as tfvis from '@tensorflow/tfjs-vis';

/**
 * Returns a random Piet palette
 */
function pietPalette(): Array<Array<number>> {
  const colors = [
    [0, 0, 0], // BLACK
    [255, 255, 255] // WHITE
  ];
  return colors;
}


export function showRandomSample(transformed: boolean) {
  const surface = tfvis.visor().surface({tab: 'Samples', name: 'Sample'});
  const imgRgb = [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]].map(row => row.map(rgb => rgb.map(v => v / 12)));
  const imgGray = imgRgb.map(row => row.map(rgb => rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11));
  tfvis.render.heatmap(surface, {values: imgGray}, {rowMajor: true, colorMap: 'greyscale'})
}
