export default class Tile {
  constructor(
    public value: number = 0,
    public meta: {
      id?: number;
      position: { row: number; col: number };
      merged?: boolean;
      isNew?: boolean;
    }
  ) {
    this.meta.id = meta.id || Date.now() + Math.random();
  }
}
