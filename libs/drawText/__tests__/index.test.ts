// @ts-nocheck

import drawText from '../src/index' // Adjust path as needed

// Mock the Canvas API
class MockContext {
	constructor() {
		this.canvas = { width: 800, height: 600 }
		this.fillStyle = '#000'
		this.font = '16px Arial'
		this._text = []
		this._rects = []
		this._clips = []
		this._saveCount = 0
		this._restoreCount = 0
	}

	measureText(text) {
		// Mock text measurements - simplistic but sufficient for tests
		// Return different widths for different characters to test letterSpacing
		if (text === 'M') {
			return {
				width: 16,
				fontBoundingBoxAscent: 12,
				fontBoundingBoxDescent: 4,
			}
		}

		return {
			width: text.length * 10, // Simple estimation for tests
			fontBoundingBoxAscent: 12,
			fontBoundingBoxDescent: 4,
		}
	}

	fillText(text, x, y) {
		this._text.push({ text, x, y })
	}

	fillRect(x, y, width, height) {
		this._rects.push({ x, y, width, height })
	}

	beginPath() {}

	rect(x, y, width, height) {
		this._clips.push({ x, y, width, height })
	}

	clip() {}

	save() {
		this._saveCount++
	}

	restore() {
		this._restoreCount++
	}
}

describe('drawText function', () => {
	let ctx

	beforeEach(() => {
		ctx = new MockContext()
		// Spy on console methods
		jest.spyOn(console, 'error').mockImplementation(() => {})
		jest.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	describe('Basic Functionality Tests', () => {
		// Test basic functionality
		test('should draw basic text', () => {
			const result = drawText(ctx, 'Hi World', 10, 10, 100, 50)

			expect(result.lines).toBe(1)
			expect(ctx._text.length).toBe(1)
			expect(ctx._text[0].text).toBe('Hi World')
			expect(ctx._text[0].x).toBe(10) // x + paddingLeft
			expect(result.overflow).toBe(false)
		})

		// Test parameter validation
		test('should handle invalid parameters', () => {
			drawText(null, 'text', 0, 0, 100, 100)
			expect(console.error).toHaveBeenCalledWith('Invalid arguments')

			drawText({}, 'text', 0, 0, 100, 100)
			expect(console.error).toHaveBeenCalledWith('Invalid arguments')

			drawText(ctx, null, 0, 0, 100, 100)
			expect(console.error).toHaveBeenCalledWith('Invalid arguments')

			drawText(ctx, 'text', null, 0, 100, 100)
			expect(console.error).toHaveBeenCalledWith('Invalid arguments')

			drawText(ctx, 'text', 0, null, 100, 100)
			expect(console.error).toHaveBeenCalledWith('Invalid arguments')
		})

		// Test default canvas size
		test('should use canvas size when width/height not provided', () => {
			const result = drawText(ctx, 'Hello World', 10, 10)

			expect(result.availableWidth).toBe(800)
			expect(result.availableHeight).toBe(600)
		})

		// Test options as width parameter
		test('should handle options as width parameter', () => {
			const result = drawText(ctx, 'Hello World', 10, 10, { color: 'red' })

			expect(result.availableWidth).toBe(800)
			expect(ctx.fillStyle).toBe('red')
		})
	})

	describe('Layout Tests', () => {
		// Test padding options
		test('should handle number padding', () => {
			const result = drawText(ctx, 'Hello World', 10, 10, 100, 50, { padding: 5 })

			expect(result.availableWidth).toBe(90) // 100 - 5*2
			expect(result.availableHeight).toBe(40) // 50 - 5*2
			expect(ctx._text[0].x).toBe(15) // 10 + 5 (paddingLeft)
		})

		test('should handle array padding', () => {
			// [top, right, bottom, left]
			const result = drawText(ctx, 'Hello World', 10, 10, 100, 50, { padding: [5, 10, 15, 20] })

			expect(result.availableWidth).toBe(70) // 100 - 10 - 20
			expect(result.availableHeight).toBe(30) // 50 - 5 - 15
			expect(ctx._text[0].x).toBe(30) // 10 + 20 (paddingLeft)
		})

		test('should handle partial array padding', () => {
			const result1 = drawText(ctx, 'Hello', 10, 10, 100, 50, { padding: [5] })
			expect(result1.availableWidth).toBe(90) // 100 - 5*2

			const result2 = drawText(ctx, 'Hello', 10, 10, 100, 50, { padding: [5, 10] })
			expect(result2.availableWidth).toBe(80) // 100 - 10 - 10

			const result3 = drawText(ctx, 'Hello', 10, 10, 100, 50, { padding: [5, 10, 15] })
			expect(result3.availableWidth).toBe(80) // 100 - 10 - 10
			expect(result3.availableHeight).toBe(30) // 50 - 5 - 15

			// Invalid padding
			const result4 = drawText(ctx, 'Hello', 10, 10, 100, 50, { padding: ['invalid'] })
			expect(result4.availableWidth).toBe(100)
			expect(result4.availableHeight).toBe(50)
		})

		// Test background padding
		test('should handle background padding', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, {
				backgroundColor: 'blue',
				backgroundPadding: 5,
			})

			expect(ctx._rects.length).toBe(1)
			expect(ctx._rects[0].width).toBe(50 + 10) // textWidth + padding*2

			drawText(ctx, 'Hello', 10, 10, 100, 50, {
				backgroundColor: 'blue',
				backgroundPadding: [5, 15],
			})

			expect(ctx._rects.length).toBe(2)
			expect(ctx._rects[1].width).toBe(50 + 15 + 15) // textWidth + paddingX*2

			// Invalid background padding
			drawText(ctx, 'Hello', 10, 10, 100, 50, {
				backgroundColor: 'blue',
				backgroundPadding: ['invalid'],
			})

			expect(ctx._rects.length).toBe(3)
		})
	})

	describe('Font Handling Tests', () => {
		// Test font processing
		test('should process string font', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, { font: '24px Arial' })

			expect(ctx.font).toBe('24px Arial')
		})

		test('should process object font', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, {
				font: {
					size: 24,
					family: 'Verdana',
					weight: 'bold',
					style: 'italic',
				},
			})

			expect(ctx.font).toBe('italic bold 24px Verdana')
		})

		test('should process partial object font', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, {
				font: { size: 24 },
			})

			expect(ctx.font).toBe('normal normal 24px Arial')
		})
	})

	describe('Text Flow Tests', () => {
		// Test text alignment
		test('should handle left alignment', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, { textAlign: 'left' })

			expect(ctx._text[0].x).toBe(10)
		})

		test('should handle center alignment', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, { textAlign: 'center' })

			// Text width is 50, centered in available width 100
			expect(ctx._text[0].x).toBe(35) // 10 + (100 - 50)/2
		})

		test('should handle right alignment', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, { textAlign: 'right' })

			// Text width is 50, right-aligned in available width 100
			expect(ctx._text[0].x).toBe(60) // 10 + 100 - 50
		})

		// Test vertical alignment
		test('should handle top vertical alignment', () => {
			const result = drawText(ctx, 'Hello', 10, 10, 100, 50, { verticalAlign: 'top' })

			// Default is top, so y should be 10 + paddingTop + fontSize
			expect(ctx._text[0].y).toBe(26) // 10 + 0 + 16
		})

		test('should handle middle vertical alignment', () => {
			const result = drawText(ctx, 'Hello', 10, 10, 100, 50, { verticalAlign: 'middle' })

			// Middle alignment should center text vertically
			// Single line height is 19.2 (16 * 1.2), center in 50px height is (50 - 19.2)/2 = 15.4
			expect(ctx._text[0].y).toBeCloseTo(26 + 15.4, 0)
		})

		test('should handle bottom vertical alignment', () => {
			const result = drawText(ctx, 'Hello', 10, 10, 100, 50, { verticalAlign: 'bottom' })

			// Bottom alignment should align to bottom
			// Single line height is 19.2 (16 * 1.2), bottom in 50px height would leave 50 - 19.2 = 30.8px from top
			expect(ctx._text[0].y).toBeCloseTo(26 + 30.8, 0)
		})

		// Test line wrapping
		test('should wrap text based on width', () => {
			// Each character is 10px wide in our mock, so "Hello World" is 110px
			// With 100px width, it should wrap into two lines
			const result = drawText(ctx, 'Hello World', 10, 10, 100, 50)

			expect(result.lines).toBe(2)
			expect(result.totalLines).toBe(2)
			expect(ctx._text.length).toBe(2)
			expect(ctx._text[0].text).toBe('Hello')
			expect(ctx._text[1].text).toBe('World')
		})

		test('should handle wrapping with non-English text', () => {
			// Test with Chinese characters (should wrap character by character)
			const result = drawText(ctx, '你好,世界', 10, 10, 30, 50)

			expect(result.lines).toBe(2)
			expect(ctx._text[0].text).toBe('你好,')
			expect(ctx._text[1].text).toBe('世界')
		})

		test('should respect wrap: false option', () => {
			const result = drawText(ctx, 'Hello World', 10, 10, 100, 50, { wrap: false })

			expect(result.lines).toBe(1)
			expect(ctx._text.length).toBe(1)
			expect(ctx._text[0].text).toBe('Hello World')
		})

		// Test letter spacing
		test('should handle letter spacing', () => {
			// With letter spacing, text should be drawn character by character
			drawText(ctx, 'ABC', 10, 10, 100, 50, { letterSpacing: 5 })

			// There should be 3 fillText calls, one for each character
			expect(ctx._text.length).toBe(3)
			expect(ctx._text[0].text).toBe('A')
			expect(ctx._text[1].text).toBe('B')
			expect(ctx._text[2].text).toBe('C')

			// Position should increment by character width (10) plus spacing (5)
			expect(ctx._text[1].x).toBe(ctx._text[0].x + 15)
			expect(ctx._text[2].x).toBe(ctx._text[1].x + 15)
		})
	})

	describe('Overflow Handling Tests', () => {
		// Test overflow handling
		test('should handle overflow: visible', () => {
			// Create text that exceeds both width and height
			// Each line should be 19.2px tall (16px * 1.2 lineHeight)
			// 5 lines would be 96px, exceeding 50px height
			const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
			const result = drawText(ctx, longText, 10, 10, 100, 50, {
				overflow: 'visible',
			})

			expect(result.overflow).toBe(true)
			expect(result.lines).toBe(5) // All lines should be visible
			expect(ctx._text.length).toBe(5)
			expect(ctx._clips.length).toBe(0) // No clipping
		})

		test('should handle overflow: hidden', () => {
			// Create text that exceeds both width and height
			// Each line should be 19.2px tall (16px * 1.2 lineHeight)
			// 5 lines would be 96px, exceeding 50px height
			// Only 2 complete lines should fit
			const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
			const result = drawText(ctx, longText, 10, 10, 100, 50, {
				overflow: 'hidden',
			})

			expect(result.overflow).toBe(true)
			expect(result.lines).toBe(2) // Only 2 lines should be visible
			expect(ctx._text.length).toBe(2)
			expect(ctx._clips.length).toBe(1) // Clipping should be applied
		})

		test('should handle textOverflow with wrap: true', () => {
			// Create text that exceeds both width and height
			const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
			const result = drawText(ctx, longText, 10, 10, 100, 50, {
				overflow: 'hidden',
				textOverflow: '...',
			})

			expect(result.overflow).toBe(true)
			expect(result.lines).toBe(2) // 2 lines should fit
			expect(ctx._text[1].text).toContain('...') // Last visible line should have ellipsis
		})

		test('should handle textOverflow with wrap: false', () => {
			// Create text that exceeds width
			const longText = 'This is a very long line that exceeds available width'
			const result = drawText(ctx, longText, 10, 10, 100, 50, {
				wrap: false,
				overflow: 'hidden',
				textOverflow: '...',
			})

			expect(result.overflow).toBe(true)
			expect(result.lines).toBe(1)
			expect(ctx._text[0].text).toContain('...') // Line should be truncated with ellipsis
			expect(ctx._text[0].text.length).toBeLessThan(longText.length)
		})

		// Test line breaks
		test('should handle line breaks', () => {
			const result = drawText(ctx, 'Line 1\nLine 2\nLine 3', 10, 10, 100, 50)

			expect(result.totalLines).toBe(3)
			expect(ctx._text.length).toBe(3)
			expect(ctx._text[0].text).toBe('Line 1')
			expect(ctx._text[1].text).toBe('Line 2')
			expect(ctx._text[2].text).toBe('Line 3')
		})

		test('should handle empty lines', () => {
			const result = drawText(ctx, 'Line 1\n\nLine 3', 10, 10, 100, 50)

			expect(result.totalLines).toBe(3)
			expect(ctx._text.length).toBe(2) // Empty line should not generate fillText call
			expect(ctx._text[0].text).toBe('Line 1')
			expect(ctx._text[1].text).toBe('Line 3')
		})
	})

	describe('Background and Style Tests', () => {
		// Test background color
		test('should draw background color', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, {
				backgroundColor: 'blue',
			})

			expect(ctx._rects.length).toBe(1)
			expect(ctx._text.length).toBe(1)
		})
	})

	describe('Edge Cases', () => {
		// Test edge cases
		test('should handle zero/negative dimensions', () => {
			const result1 = drawText(ctx, 'Hello', 10, 10, 0, 50)
			expect(result1.lines).toBe(0)

			const result2 = drawText(ctx, 'Hello', 10, 10, 100, 0)
			expect(result2.lines).toBe(0)

			const result3 = drawText(ctx, 'Hello', 10, 10, -10, 50)
			expect(result3.lines).toBe(0)
		})

		test('should handle empty text', () => {
			const result = drawText(ctx, '', 10, 10, 100, 50)
			console.log(result)
			expect(result.lines).toBe(1)
			expect(result.textHeight).toBe(16 * 1.2) //fontSize * lineHeight
			expect(ctx._text.length).toBe(0)
		})
	})

	describe('environment tests', () => {
		// Test save/restore
		test('should save and restore context', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50)

			expect(ctx._saveCount).toBe(1)
			expect(ctx._restoreCount).toBe(1)
		})

		// Test measureTextWidth
		test('should measure text width correctly', () => {
			// Normal text
			const result1 = drawText(ctx, 'Hello', 10, 10, 100, 50)
			expect(result1.textWidth).toBe(50) // 5 chars * 10px

			// With letter spacing
			const result2 = drawText(ctx, 'Hello', 10, 10, 100, 50, { letterSpacing: 2 })
			expect(result2.textWidth).toBe(50 + 4 * 2) // 5 chars * 10px + 4 spaces * 2px
		})

		// Test calculateTextMetrics
		test('should calculate text metrics', () => {
			drawText(ctx, 'Hello', 10, 10, 100, 50, { font: { size: 20 } })

			// Metrics should be based on fontSize and lineHeight
			expect(ctx._text[0].y).toBeCloseTo(10 + 20, 0) // y + fontSize
		})
	})

	// Test prototype extension
	describe('drawText.use', () => {
		test('should extend CanvasRenderingContext2D prototype', () => {
			// Backup original
			const originalDrawText = CanvasRenderingContext2D.prototype.drawText
			let canvas = document.createElement('canvas')
			const context = canvas.getContext('2d')! as CanvasRenderingContext2D

			// Test method doesn't exist yet
			expect(context.drawText).toBeUndefined()

			// Add method
			drawText.use()

			// Method should now exist
			expect(typeof context.drawText).toBe('function')

			// Call method
			const result = context.drawText('Hello', 10, 10, 100, 50)
			// Check it works
			expect(result.lines).toBe(1)

			// Test warning for existing method
			console.warn.mockClear()
			drawText.use()
			expect(console.warn).toHaveBeenCalled()

			// Clean up
			delete CanvasRenderingContext2D.prototype.drawText
			canvas.remove()
			canvas = null

			// If original existed, restore it
			if (originalDrawText) {
				CanvasRenderingContext2D.prototype.drawText = originalDrawText
			}
		})

		test('should handle missing CanvasRenderingContext2D', () => {
			// Backup original
			const originalContext = global.CanvasRenderingContext2D
			// Remove context
			delete global.CanvasRenderingContext2D

			// Try to use
			drawText.use()
			// Should log error
			expect(console.error).toHaveBeenCalled()

			// Restore original
			global.CanvasRenderingContext2D = originalContext
		})
	})
})
