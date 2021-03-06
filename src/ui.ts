import Colorthief from '../node_modules/colorthief/dist/color-thief.umd.js'
import * as Vibrant from 'node-vibrant'
import { getTextColorsFromRGB } from './colors'

interface ImageProps {
  img: HTMLElement;
  dominantColor: RGB;
  palette: RGB[][];
  names: any[];
}

function getImageColors(bytes): Promise<ImageProps> {
  const img = document.createElement('img')
  const blob = new Blob( [ bytes ], { type: "image/jpeg" });
  const urlCreator = window.URL
  const imageUrl = urlCreator.createObjectURL(blob)
  img.setAttribute('src', imageUrl)
  return new Promise(res => {
    img.onload = function() {
      Vibrant.from(img)
        .getPalette()
        .then(colorPalette => {
          let palette = []
          let names = []
          let dominantColor = { r: colorPalette.Vibrant.rgb[0] / 255, g: colorPalette.Vibrant.rgb[1] / 255, b: colorPalette.Vibrant.rgb[2] / 255 }

            for (var swatch in colorPalette) {
              if (colorPalette.hasOwnProperty(swatch) && colorPalette[swatch]) {
                names.push(swatch)
                let color = colorPalette[swatch].getRgb()
                palette.push({ r: color[0] / 255, g: color[1] / 255, b: color[2] / 255 })
              }
            }

            res({ img, dominantColor, palette, names })
        })
    }
  })
}

window.onmessage = async (event) => {
  const { data } = event
  const { pluginMessage } = data
  const { imageBytes, width, height } = pluginMessage
  const { img, dominantColor, palette, names } = await getImageColors(imageBytes)
  img.setAttribute('width', width)
  img.setAttribute('height', height)
  const suggestedTextColors = getTextColorsFromRGB(dominantColor)
  window.parent.postMessage({ pluginMessage: { dominantColor, suggestedTextColors, palette, names } }, '*')
}