/**
 * @jest-environment jsdom
 */

import detectMouseDirection from '../detectMouseDirection'

describe('detectMouseDirection', () => {
	// Mock HTMLElement
	let element: HTMLElement
	let onEnter: jest.Mock
	let onLeave: jest.Mock
	let cleanup: () => void

	beforeEach(() => {
		// Setup DOM element
		element = document.createElement('div')
		document.body.appendChild(element)

		// Setup mock callbacks
		onEnter = jest.fn()
		onLeave = jest.fn()

		// Initialize the detector
		cleanup = detectMouseDirection(element, onEnter, onLeave)
	})

	afterEach(() => {
		// Cleanup after each test
		cleanup()
		document.body.removeChild(element)
		jest.clearAllMocks()
	})

	// 鼠标从四个不同方向（上、右、下、左）进入元素
	describe('Mouse Enter Detection', () => {
		const testCases = [
			{
				name: 'from right',
				start: { x: 100, y: 50 },
				end: { x: 50, y: 50 },
				expected: 'right',
			},
			{
				name: 'from bottom',
				start: { x: 50, y: 100 },
				end: { x: 50, y: 50 },
				expected: 'bottom',
			},
			{
				name: 'from left',
				start: { x: 0, y: 50 },
				end: { x: 50, y: 50 },
				expected: 'left',
			},
			{
				name: 'from top',
				start: { x: 50, y: 0 },
				end: { x: 50, y: 50 },
				expected: 'top',
			},
		]

		testCases.forEach(({ name, start, end, expected }) => {
			it(`should detect enter ${name}`, () => {
				// Simulate mouse movement
				document.dispatchEvent(new MouseEvent('mousemove', { clientX: start.x, clientY: start.y }))

				// Simulate mouse enter
				element.dispatchEvent(new MouseEvent('mouseenter', { clientX: end.x, clientY: end.y }))

				expect(onEnter).toHaveBeenCalledWith(expected, expect.any(MouseEvent))
			})
		})
	})

	// 鼠标从四个不同方向离开元素
	describe('Mouse Leave Detection', () => {
		const testCases = [
			{
				name: 'to right',
				start: { x: 50, y: 50 },
				end: { x: 100, y: 50 },
				expected: 'right',
			},
			{
				name: 'to bottom',
				start: { x: 50, y: 50 },
				end: { x: 50, y: 100 },
				expected: 'bottom',
			},
			{
				name: 'to left',
				start: { x: 50, y: 50 },
				end: { x: 0, y: 50 },
				expected: 'left',
			},
			{
				name: 'to top',
				start: { x: 50, y: 50 },
				end: { x: 50, y: 0 },
				expected: 'top',
			},
		]

		testCases.forEach(({ name, start, end, expected }) => {
			it(`should detect leave ${name}`, () => {
				// Set initial position
				document.dispatchEvent(new MouseEvent('mousemove', { clientX: start.x, clientY: start.y }))

				// Simulate mouse leave
				element.dispatchEvent(new MouseEvent('mouseleave', { clientX: end.x, clientY: end.y }))

				expect(onLeave).toHaveBeenCalledWith(expected, expect.any(MouseEvent))
			})
		})
	})

	// 边缘情况处理
	describe('Edge Cases', () => {
		// 没有先前鼠标移动事件的情况下的进入
		it('should handle mouseenter without prior mousemove', () => {
			element.dispatchEvent(new MouseEvent('mouseenter', { clientX: 50, clientY: 50 }))
			expect(onEnter).not.toHaveBeenCalled()
		})

		// 没有先前鼠标移动事件的情况下离开
		it('should handle mouseleave without prior mousemove', () => {
			element.dispatchEvent(new MouseEvent('mouseleave', { clientX: 50, clientY: 50 }))
			expect(onLeave).not.toHaveBeenCalled()
		})

		// 对角线移动的处理
		it('should handle diagonal movements', () => {
			// Bottom-right movement (45 degrees)
			document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }))
			element.dispatchEvent(new MouseEvent('mouseenter', { clientX: 100, clientY: 100 }))
			expect(onEnter).toHaveBeenCalledWith('top', expect.any(MouseEvent))
		})

		// 事件监听器的清理
		it('should cleanup event listeners', () => {
			const documentRemoveSpy = jest.spyOn(document, 'removeEventListener')
			const elementRemoveSpy = jest.spyOn(element, 'removeEventListener')

			cleanup()

			expect(documentRemoveSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
			expect(elementRemoveSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
			expect(elementRemoveSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
		})
	})
})
