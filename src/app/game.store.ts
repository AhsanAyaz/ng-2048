import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

export interface GameState {
  /** The tiles state. */
  grid: number[][];
  /** The current score */
  score: number;
}

export interface Tile {
  row: number;
  col: number;
  value: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameStore extends ComponentStore<GameState> {
  constructor() {
    // set defaults
    super({
      score: 0,
      grid: [
        [0, 2, 0, 0],
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 4, 4, 8],
      ],
    });
  }

  private transpose = (m: number[][]) => m[0].map((x, i) => m.map((x) => x[i]));

  // *********** Updaters *********** //

  readonly setScore = this.updater((state, value: number) => ({
    ...state,
    score: state.score || state.score < value ? value : state.score || 0,
  }));

  readonly generateRandomNumber = this.updater((state) => {
    const emptyTiles: number[][] = [];
    state.grid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 0) {
          emptyTiles.push([rowIndex, colIndex]);
        }
      });
    });
    if (emptyTiles.length === 0) {
      return state;
    }
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const [row, col] = emptyTiles[randomIndex];
    return {
      ...state,
      grid: [
        ...state.grid.slice(0, row),
        [
          ...state.grid[row].slice(0, col),
          Math.random() > 0.9 ? 4 : 2,
          ...state.grid[row].slice(col + 1),
        ],
        ...state.grid.slice(row + 1),
      ],
    };
  });

  readonly moveLeft = this.updater((state) => {
    const grid = [...state.grid];
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const row = grid[rowIndex];
      for (let colIndex = row.length - 1; colIndex >= 0; colIndex--) {
        if (row[colIndex] === 0) {
          continue;
        }
        let nextColIndex = colIndex - 1;
        while (nextColIndex >= 0) {
          if (row[nextColIndex] === 0) {
            nextColIndex--;
            continue;
          }
          if (row[colIndex] === row[nextColIndex]) {
            grid[rowIndex][nextColIndex] = row[colIndex] * 2;
            grid[rowIndex][colIndex] = 0;
            this.setScore(grid[rowIndex][nextColIndex]);
            colIndex = nextColIndex;
          }
          break;
        }
      }
      const filtered = grid[rowIndex].filter((col) => col !== 0);
      const missing = 4 - filtered.length;
      const zeros = Array(missing).fill(0);
      grid[rowIndex] = [...filtered, ...zeros];
    }
    return {
      ...state,
      grid,
    };
  });

  readonly moveRight = this.updater((state) => {
    const grid = [...state.grid];
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const row = grid[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        if (row[colIndex] === 0) {
          continue;
        }
        let nextColIndex = colIndex + 1;
        while (nextColIndex <= row.length) {
          if (row[nextColIndex] === 0) {
            nextColIndex++;
            continue;
          }
          if (row[colIndex] === row[nextColIndex]) {
            grid[rowIndex][nextColIndex] = row[colIndex] * 2;
            grid[rowIndex][colIndex] = 0;
            this.setScore(grid[rowIndex][nextColIndex]);
            colIndex = nextColIndex;
          }
          break;
        }
      }
      const filtered = grid[rowIndex].filter((col) => col !== 0);
      const missing = 4 - filtered.length;
      const zeros = Array(missing).fill(0);
      grid[rowIndex] = [...zeros, ...filtered];
    }
    return {
      ...state,
      grid,
    };
  });

  readonly moveTop = this.updater((state) => {
    const grid = [...this.transpose(state.grid)];
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const row = grid[rowIndex];
      for (let colIndex = row.length - 1; colIndex >= 0; colIndex--) {
        if (row[colIndex] === 0) {
          continue;
        }
        let nextColIndex = colIndex - 1;
        while (nextColIndex >= 0) {
          if (row[nextColIndex] === 0) {
            nextColIndex--;
            continue;
          }
          if (row[colIndex] === row[nextColIndex]) {
            grid[rowIndex][nextColIndex] = row[colIndex] * 2;
            grid[rowIndex][colIndex] = 0;
            this.setScore(grid[rowIndex][nextColIndex]);
            colIndex = nextColIndex;
          }
          break;
        }
      }
      const filtered = grid[rowIndex].filter((col) => col !== 0);
      const missing = 4 - filtered.length;
      const zeros = Array(missing).fill(0);
      grid[rowIndex] = [...filtered, ...zeros];
    }
    return {
      ...state,
      grid: this.transpose(grid),
    };
  });

  readonly moveBottom = this.updater((state) => {
    const grid = [...this.transpose(state.grid)];
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const row = grid[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        if (row[colIndex] === 0) {
          continue;
        }
        let nextColIndex = colIndex + 1;
        while (nextColIndex <= row.length) {
          if (row[nextColIndex] === 0) {
            nextColIndex++;
            continue;
          }
          if (row[colIndex] === row[nextColIndex]) {
            grid[rowIndex][nextColIndex] = row[colIndex] * 2;
            grid[rowIndex][colIndex] = 0;
            this.setScore(grid[rowIndex][nextColIndex]);
            colIndex = nextColIndex;
          }
          break;
        }
      }
      const filtered = grid[rowIndex].filter((col) => col !== 0);
      const missing = 4 - filtered.length;
      const zeros = Array(missing).fill(0);
      grid[rowIndex] = [...zeros, ...filtered];
    }
    return {
      ...state,
      grid: this.transpose(grid),
    };
  });

  // *********** Selectors *********** //

  readonly grid$ = this.select(({ grid }) => grid);

  readonly score$ = this.select(({ score }) => {
    return score;
  });

  readonly tiles$ = this.select(({ grid }) => {
    const tiles: Tile[] = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 0) {
          return;
        }
        tiles.push({
          row: rowIndex,
          col: colIndex,
          value: col,
        });
      });
    });
    return tiles;
  });

  // ViewModel of Paginator component
  readonly vm$ = this.select(this.state$, (state) => ({
    score: state.score,
    grid: state.grid,
  }));
}
