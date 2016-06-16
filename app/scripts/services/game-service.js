(function () {
	angular
		.module('myApp')
		.service('GameService', GameService)

	function GameService() {

		let vm = this
		let game = {
			isRunning: false,
			hasWon: false,
			hasLost: false,
			difficulty: false,
			started: Date.now(),
			finished: Date.now(),
			grid: []
		}
		vm.getGame = getGame
		vm.sweep = sweep
		vm.flag = flag

		function sweep(cell) {
			if (!game.isRunning) return
			cell.isRevealed = true
			checkEmpty(cell)
			if (cell.hasMine) {
				game.hasLost = true
				game.isRunning = false
			}
			checkWin()
		}

		function checkEmpty(cell) {
			let x = cell.x
			let y = cell.y
			let search = [
				[x - 1, y - 1], // top left
				[x, y - 1], // top middle
				[x + 1, y - 1], // top right
				[x - 1, y], // left
				[x + 1, y], // right
				[x - 1, y + 1], // bottom left
				[x, y + 1], // bottom middle
				[x + 1, y + 1] // bottom right
			]
			cell.isRevealed = true
			if (!cell.touching) {
				search.forEach((adjacent) => {
					let flag = true
					adjacent.forEach((coord) => {
						if (coord > game.grid.length - 1 || coord < 0) flag = false
					})
					if (flag && !game.grid[adjacent[1]][adjacent[0]].isRevealed) {
						checkEmpty(game.grid[adjacent[1]][adjacent[0]])
					}
				})
			}
			return null
		}

		function flag(cell) {
			if (!game.isRunning) return
			if (!cell.isRevealed) cell.hasFlag = !cell.hasFlag
			checkWin()
		}

		function checkWin() {
			let tally = 0
			let flags = 0
			game.grid.forEach((row) => {
				row.forEach((cell) => {
					if (cell.hasFlag) flags++
					if (cell.hasFlag && cell.hasMine) tally++
				})
			})
			if (tally === game.difficulty * 9 && flags === tally) {
				game.hasWon = true
				game.isRunning = false
				game.finished = Date.now()
			}
			if (game.hasLost) {
				game.grid.forEach((row) => {
					row.forEach((cell) => {
						cell.isRevealed = true
					})
				})
			}
		}

		function getGame(difficulty) {
			if (difficulty > 2 || difficulty < 0) difficulty = 0
			difficulty += 1
			game.grid = createGrid(difficulty * 10)
			placeMines(game.grid, difficulty * 9)
			calcMines(game.grid)
			game.isRunning = true
			game.hasWon = false
			game.hasLost = false
			game.started = Date.now()
			game.difficulty = difficulty
			return game
		}

		function createGrid(size) {
			let out = []
			let cell = {
				x: 0,
				y: 0,
				hasMine: false,
				hasFlag: false,
				isRevealed: false,
				touching: 0
			}
			for (let i = 0; i < size; i++) {
				out.push([])
				for (let j = 0; j < size; j++) {
					out[i].push(Object.assign({}, cell))
					let current = out[i][j]
					current.x = j
					current.y = i
				}
			}
			return out
		}

		function randomCell(max) {
			let out = { x: null, y: null }
			out.x = chance.integer({ min: 0, max: max })
			out.y = chance.integer({ min: 0, max: max })
			return out;
		}

		function isObjEq(a, b) {
			let out = true
			let x = Object.keys(a)
			let y = Object.keys(b)
			for (let i = 0; i < x.length; i++) {
				if (a[x[i]] != b[y[i]]) out = false
			}
			return out
		}

		function placeMines(grid, difficulty) {
			let mines = []
			let flag = 1
			while (mines.length < difficulty) {
				flag = 1
				let mine = randomCell(grid.length - 1)
				mines.forEach((x) => {
					if (isObjEq(mine, x)) flag = 0
				})
				if (flag) mines.push(mine)
			}
			mines.forEach((x) => {
				grid[x.y][x.x].hasMine = true
			})
			return grid
		}

		function findTouching(grid, cell) {
			let out = 0
			let x = cell.x
			let y = cell.y
			let search = [
				[x - 1, y - 1], // top left
				[x, y - 1], // top middle
				[x + 1, y - 1], // top right
				[x - 1, y], // left
				[x + 1, y], // right
				[x - 1, y + 1], // bottom left
				[x, y + 1], // bottom middle
				[x + 1, y + 1] // bottom right
			]
			search.forEach((coords, index) => {
				let flag = true
				coords.forEach((coord) => {
					if (coord > grid.length - 1 || coord < 0) flag = false
				})
				if (flag) {
					if (grid[search[index][1]][search[index][0]].hasMine) out++
				}
			})
			return out
		}

		function calcMines(grid) {
			grid.forEach((row) => {
				row.forEach((cell) => {
					cell.touching = findTouching(grid, cell)
				})
			})
			return grid
		}


	}

})()