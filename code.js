// Add this at the top of code.js
async function ensureDocumentAccess() {
  if (figma.currentPage.selection.length === 0) {
    await figma.loadAllPagesAsync();
  }
}

figma.showUI(__html__, { width: 800, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'extract-styles') {
    try {
      const textStyles = await figma.getLocalTextStylesAsync(); // Changed to async
      const extractedStyles = textStyles.map(style => extractTextStyleData(style));
      
      figma.ui.postMessage({
        type: 'styles-extracted',
        styles: extractedStyles
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: error.message
      });
    }
  }
};


function extractTextStyleData(style) {
  const textStyle = style.textStyleId ? figma.getStyleById(style.textStyleId) : style;
  
  // Get the style properties - we need to handle mixed styles
  const fontSize = textStyle.fontSize !== figma.mixed ? textStyle.fontSize : 16;
  const fontName = textStyle.fontName !== figma.mixed ? textStyle.fontName : { family: 'Inter', style: 'Regular' };
  const fontWeight = textStyle.fontWeight !== figma.mixed ? textStyle.fontWeight : 400;
  const lineHeight = textStyle.lineHeight !== figma.mixed ? textStyle.lineHeight : { unit: 'AUTO' };
  const letterSpacing = textStyle.letterSpacing !== figma.mixed ? textStyle.letterSpacing : { unit: 'PERCENT', value: 0 };
  const textCase = textStyle.textCase !== figma.mixed ? textStyle.textCase : 'ORIGINAL';
  const textDecoration = textStyle.textDecoration !== figma.mixed ? textStyle.textDecoration : 'NONE';
  const paragraphSpacing = textStyle.paragraphSpacing !== figma.mixed ? textStyle.paragraphSpacing : 0;

  return {
    name: style.name,
    id: style.id,
    fontFamily: fontName.family,
    fontStyle: fontName.style,
    fontSize: fontSize,
    fontWeight: fontWeight,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    textCase: textCase,
    textDecoration: textDecoration,
    paragraphSpacing: paragraphSpacing
  };
}