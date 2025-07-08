import { toPng } from 'html-to-image'

export interface ExportImageOptions {
  format?: 'png' | 'jpeg'
  quality?: number
  backgroundColor?: string
  scale?: number
}

/**
 * Downloads an image from base64 data
 * @param base64Data - Base64 encoded image data
 * @param filename - Name of the file to download
 */
export function downloadImage(base64Data: string, filename: string): void {
  const link = document.createElement('a')
  link.href = base64Data
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Simple export function based on React Flow's official example
 * @param reactFlowWrapper - The React Flow wrapper element
 * @param reactFlowInstance - The React Flow instance
 * @param options - Export options
 * @returns Promise<string> - Base64 encoded image data
 */
export async function exportCanvasAsImage(
  reactFlowWrapper: HTMLElement | null,
  reactFlowInstance: any,
  options: ExportImageOptions = {}
): Promise<string> {
  if (!reactFlowWrapper) {
    throw new Error('React Flow wrapper element not found')
  }

  const {
    backgroundColor = '#ffffff',
    scale = 2
  } = options

  try {
    // First, fit view to show all content
    if (reactFlowInstance && reactFlowInstance.fitView) {
      reactFlowInstance.fitView({ 
        padding: 0.1,
        includeHiddenNodes: false,
        duration: 0 
      })
      
      // Wait for the view to update
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Find the React Flow container
    const reactFlowContainer = reactFlowWrapper.querySelector('.react-flow') as HTMLElement
    if (!reactFlowContainer) {
      throw new Error('React Flow container not found')
    }

    // Configure html-to-image options (simplified like the official example)
    const imageOptions: any = {
      backgroundColor,
      scale, // Let html-to-image handle the scaling
      filter: (node: any) => {
        // Filter out controls and other UI elements
        const exclusionClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel']
        return !exclusionClasses.some((className) => 
          node.classList?.contains(className)
        )
      }
    }

    // Export as PNG (simplified like the official example)
    const dataUrl = await toPng(reactFlowContainer, imageOptions)
    return dataUrl
  } catch (error) {
    console.error('Error exporting canvas as image:', error)
    throw error
  }
}

/**
 * Exports and downloads the React Flow canvas as an image
 * @param reactFlowWrapper - The React Flow wrapper element
 * @param reactFlowInstance - The React Flow instance
 * @param filename - Name of the file to download
 * @param options - Export options
 */
export async function exportAndDownloadCanvas(
  reactFlowWrapper: HTMLElement | null,
  reactFlowInstance: any,
  filename: string,
  options: ExportImageOptions = {}
): Promise<void> {
  try {
    const imageData = await exportCanvasAsImage(reactFlowWrapper, reactFlowInstance, options)
    downloadImage(imageData, filename)
  } catch (error) {
    console.error('Error exporting and downloading canvas:', error)
    throw error
  }
}

