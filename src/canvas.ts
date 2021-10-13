import { getFirstImagePaintFromNode, UIColorData } from "./utils";

export async function generateColorGuideFrame(node, data: UIColorData): Promise<SceneNode> {
  const { palette, names } = data

  const swatchSize = 50
  const labelHeight = 12
  const labelBottomMargin = 8 + labelHeight
  const swatchGap = 8
  const maxWidth = 372
  const maxImagePreviewHeight = 372
  const leftMargin = 16
  const black = { r: 0, g: 0, b: 0 }
  const white = { r: 1, g: 1, b: 1 }
  const paletteCornerRadius = 6
  
  const imagePreviewInset = 16
  const imageBoundsHeight = node.height > maxImagePreviewHeight
  ? maxImagePreviewHeight
  : node.height + (imagePreviewInset * 2) > maxImagePreviewHeight
  ? maxImagePreviewHeight
  : node.height + (imagePreviewInset * 2)
  
  const contentStartY = imageBoundsHeight
  const totalHeight = imageBoundsHeight + (swatchSize * 2) - 8 + leftMargin

  const sf = { family: 'SF Pro Text', style: 'Regular'}
  const roboto = { family: 'Roboto', style: 'Regular' }
  const fonts = await figma.listAvailableFontsAsync()
  const hasSf = fonts.find(({ fontName}) => fontName.family === sf.family && fontName.style === sf.style)
  hasSf ? await figma.loadFontAsync(sf) : await figma.loadFontAsync(roboto)

  const frame = figma.createFrame()
  frame.resize(maxWidth, totalHeight)
  // frame.x = node.x + node.width + 100
  // frame.y = node.y
  frame.x = 400
  frame.y = 500
  frame.backgrounds = []
  frame.effects = []
  frame.name = "Palette"
  frame.clipsContent = false
  const background = figma.createRectangle()
  frame.appendChild(background)
  background.x = 0
  background.y = 0
  background.resize(maxWidth, totalHeight)
  background.cornerRadius = paletteCornerRadius
  background.fills = [{ color: white, type: 'SOLID' }]
  background.effects = [{ type: 'DROP_SHADOW', visible: true, blendMode: "NORMAL", radius: 12, offset: { x: 0, y: 2 }, color: { ...black, a: 0.16 }}]

  // const imageBackground = figma.createRectangle()
  // imageBackground.y = 0
  // imageBackground.topLeftRadius = paletteCornerRadius
  // imageBackground.topRightRadius = paletteCornerRadius
  // imageBackground.resize(maxWidth, imageBoundsHeight)
  // imageBackground.fills = [{ type: 'SOLID', color: dominantColor, opacity: 0.08 }]
  // imageBackground.effects = [{ type: 'INNER_SHADOW', visible: true, blendMode: "NORMAL", radius: 0, offset: { x: 0, y: -1 }, color: { ...black, a: 0.08 }}]

  const imageBounds = figma.createRectangle()
  imageBounds.name = "Source image"

  // frame.appendChild(imageBackground)
  frame.appendChild(imageBounds)

  const paint = getFirstImagePaintFromNode(node)
  
  imageBounds.fills = [ paint]
  imageBounds.cornerRadius = node.cornerRadius
  imageBounds.resize(node.width >= maxWidth ? maxWidth : node.width, node.height <= maxImagePreviewHeight ? node.height : maxImagePreviewHeight)
  imageBounds.y = node.height >= maxImagePreviewHeight
    ? 0
    : node.height + imagePreviewInset >= maxImagePreviewHeight
      ? (maxImagePreviewHeight - node.height) / 2
      : imagePreviewInset
  imageBounds.x = node.width >= maxWidth
    ? 0
    : (maxWidth - node.width) / 2


  for(let i = 0; i < palette.length; i++) {
    const swatches = []
    // LABELS
    const colorLabel = figma.createText()
    colorLabel.fills = [{ type: 'SOLID', color: black }]
    colorLabel.fontSize = 10
    colorLabel.textAlignHorizontal = 'CENTER'
    colorLabel.resize(55, (swatchSize / 2))
    colorLabel.fontName = hasSf ? sf : roboto
    colorLabel.name = 'label'
    colorLabel.characters = names[i]
    colorLabel.fontSize = 10
    colorLabel.x = leftMargin + (i * (swatchSize + swatchGap))
    colorLabel.y = contentStartY + labelBottomMargin + 54
    
    // SWATCHES
    const swatch = figma.createEllipse()
    swatch.resize(swatchSize, swatchSize)
    let color = palette[i]
    let paletteSwatch = swatch.clone()
    paletteSwatch.name = 'color'
    paletteSwatch.x = leftMargin + (i * (swatchSize + swatchGap))
    paletteSwatch.y = contentStartY + labelBottomMargin
    paletteSwatch.fills = [{ type: 'SOLID', color }]

    swatches.push(colorLabel, paletteSwatch)
    let group = figma.group(swatches, frame)
    group.name = names[i]
    group.x = leftMargin + (i * (swatchSize + swatchGap))
    group.y = contentStartY + labelBottomMargin
    frame.appendChild(group)
    // frame.appendChild(paletteSwatch)
    // frame.appendChild(colorLabel)

    
  }

  return Promise.resolve(frame)
}