class Scrollbar {
	constructor(canvas, options) {
		options = {
			x: 0,
			y: 0,
			width: 10,
			height: 10,
			direction: 'vertical', // 滚动方向, 可选值:'vertical'|'y', 'horizontal'|'x'
			style: {
				color: '#000',
				hoverColor: '#000',
				backgroundColor: '#fff',
				radius: 0,
				padding: 0,
			},
			contentSize: 100, //内容尺寸
			viewportSize: 100, //视口尺寸
			onscroll: () => {},
		}
	}

	draw() {
		//
	}

	// 更新内容和视口尺寸
	update(contentSize, viewportSize) {
		//
	}

	scrollTo() {
		//
	}

	show() {
		//
	}

	hide() {
		//
	}

	destroy() {
		//
	}
}
