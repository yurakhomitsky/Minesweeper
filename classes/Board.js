import { TILE_STATUSES } from '../shared/enums/tile-statutes.enum.js';
import { randomNumber } from '../shared/utils/random-number.js';
import { Tile } from './Tile.js';

export class Board {
  board = [];
  boardElement = null;
  statusElement = null;

  constructor(root, boardSize, numberOfMines) {
    this.root = root;
    this.boardSize = boardSize;
    this.numberOfMines = numberOfMines;
    this.boardElement = this.createBoardElement();
    this.statusElement = this.createStatusElement();
    this.init();
  }

  init() {
    this.generate();
    this.render();
    this.setStatus(this.numberOfMines);
    this.addListeners();
  }

  generate() {
    const board = [];
    const minePositions = this.getMinePositions();

    for (let x = 0; x < this.boardSize; x++) {
      const row = [];

      for (let y = 0; y < this.boardSize; y++) {
        const isMine = this.isMine({ x, y }, minePositions);
        const tile = new Tile(x, y, isMine);

        row.push(tile);
        this.boardElement.append(tile.element);
      }

      board.push(row);
    }

    this.board = board;
    console.log(this.board);
  }

  render() {
    const boardContainer = document.createElement('div');
    boardContainer.id = 'board-container';
    boardContainer.append(this.statusElement, this.boardElement);

    const boardInRoot = this.root.querySelector('#board-container');

    if (boardInRoot) {
      this.root.replaceChild(boardContainer, boardInRoot);
    } else {
      this.root.append(boardContainer);
    }
  }

  addListeners() {
    this.handleClickEvent = this.handleClickEvent.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);

    this.boardElement.addEventListener('click', this.handleClickEvent);
    this.boardElement.addEventListener('contextmenu', this.handleContextMenu);
  }

  setStatus(score, text = 'Mine left: ') {
    const [statusText, statusScore] = this.statusElement.childNodes;
    statusText.textContent = text;
    statusScore.textContent = score;
  }

  isMine(tile, minePositions) {
    return minePositions.some(this.positionMatch(tile));
  }

  handleClickEvent(event) {
    const tileId = event.target.dataset.id;
    if (tileId) {
      const tile = this.findTileByCoordinate(tileId);
      this.revealTile(tile);
      this.checkGameEnd();
    }
  }

  handleContextMenu(event) {
    event.preventDefault();
    const tileId = event.target.dataset.id;

    if (tileId) {
      const tile = this.findTileByCoordinate(tileId);
      tile.mark();
      this.listMinesLeft();
    }
  }

  revealTile(tile) {
    if (tile && tile.status !== TILE_STATUSES.HIDDEN) {
      return;
    }

    tile.reveal();

    if (tile.status === TILE_STATUSES.NUMBER) {
      const adjacentTiles = this.nearByTiles(tile);
      const mines = adjacentTiles.filter((t) => t.isMine);

      if (!mines.length) {
        adjacentTiles.forEach(this.revealTile.bind(this));
      } else {
        tile.value = mines.length;
      }
    }
  }

  checkGameEnd() {
    const win = this.checkWin();
    const lose = this.checkLose();

    if (win || lose) {
      this.boardElement.removeEventListener('click', this.handleClickEvent);
      this.boardElement.removeEventListener('contextmenu', this.handleContextMenu);
    }

    if (win) {
      this.setStatus('You Win', '');
    }

    if (lose) {
      this.setStatus('You Lose', '');
      this.revealMines();
    }
  }

  checkWin() {
    return this.board.every((row) =>
      row.every((tile) => {
        return (
          tile.status === TILE_STATUSES.NUMBER ||
          (tile.isMine && (tile.status === TILE_STATUSES.HIDDEN || tile.status === TILE_STATUSES.MARKED))
        );
      })
    );
  }

  checkLose() {
    return this.board.some((row) => row.some((tile) => tile.status === TILE_STATUSES.MINE));
  }

  revealMines() {
    this.board.forEach((row) =>
      row.forEach((tile) => {
        if (tile.status === TILE_STATUSES.MARKED) {
          tile.mark();
        }

        if (tile.isMine) {
          tile.reveal();
        }
      })
    );
  }

  nearByTiles({ x, y }) {
    const tiles = [];

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const tile = this.board[x + xOffset]?.[y + yOffset];
        if (tile) {
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }

  listMinesLeft() {
    const markedTilesCount = this.board.reduce((count, row) => {
      return count + row.filter((tile) => tile.status === TILE_STATUSES.MARKED).length;
    }, 0);

    this.setStatus(this.numberOfMines - markedTilesCount);
  }

  findTileByCoordinate(id) {
    if (!id) {
      return;
    }
    const [x, y] = id.split('-');
    return this.board[x][y];
  }

  getMinePositions() {
    const positions = [];

    while (positions.length < this.numberOfMines) {
      const position = {
        x: randomNumber(this.boardSize),
        y: randomNumber(this.boardSize)
      };

      if (!positions.some(this.positionMatch(position))) {
        positions.push(position);
      }
    }
    return positions;
  }

  positionMatch(position1) {
    return function (position2) {
      return position1.x === position2.x && position1.y === position2.y;
    };
  }

  createBoardElement() {
    const board = document.createElement('section');
    board.className = 'board';
    board.style.setProperty('--size', this.boardSize);

    return board;
  }

  createStatusElement() {
    const status = document.createElement('div');
    status.className = 'status';

    const statusText = document.createElement('span');
    statusText.className = 'status-text';

    const statusScore = document.createElement('span');
    statusScore.className = 'status-score';

    status.append(statusText, statusScore);

    return status;
  }
}
