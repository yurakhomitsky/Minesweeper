import { TILE_STATUSES } from '../shared/enums/tile-statutes.enum.js';

export class Tile {
  constructor(x, y, isMine, { tagName, status } = {}) {
    this.x = x;
    this.y = y;
    this.isMine = isMine;
    this.element = this.createTileElement(tagName, status);
    this.init();
  }

  init(status) {
    this.status = status;
    this.id = `${this.x}-${this.y}`;
  }

  set status(value) {
    this.element.dataset.status = value || TILE_STATUSES.HIDDEN;
  }

  get status() {
    return this.element.dataset.status;
  }

  set id(value) {
    this.element.dataset.id = value;
  }

  get id() {
    return this.element.dataset.id;
  }

  set value(value) {
    this.element.textContent = value;
  }

  get value() {
    return this.element.textContent;
  }

  mark() {
    if (this.status === TILE_STATUSES.MARKED) {
      this.status = TILE_STATUSES.HIDDEN;
    } else {
      this.status = TILE_STATUSES.MARKED;
    }
  }

  reveal() {
    if (this.status !== TILE_STATUSES.HIDDEN) {
      return;
    }

    if (this.isMine) {
      this.status = TILE_STATUSES.MINE;
    } else {
      this.status = TILE_STATUSES.NUMBER;
    }
  }

  createTileElement(tagName = 'div') {
    const element = document.createElement(tagName);
    return element;
  }
}
