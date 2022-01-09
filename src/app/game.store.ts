import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import Tile from './tile';

export enum GameStates {
  INITIALIZED = 'intialized',
  WIN = 'win',
  LOSE = 'lose',
}

export interface GameState {
  /** The tiles state. */
  grid: Tile[][];
  /** The current score */
  score: number;

  gameState: GameStates;
}

const INITIAL_STATE: GameState = {
  score: 0,
  grid: new Array(4).fill(0).map((_, rowIndex) =>
    new Array(4).fill(0).map((_, colIndex) => {
      return new Tile(0, {
        position: { row: rowIndex, col: colIndex },
      });
    })
  ),
  gameState: GameStates.INITIALIZED,
};
INITIAL_STATE.grid[0][0].value = 2;
INITIAL_STATE.grid[2][3].value = 2;

@Injectable({
  providedIn: 'root',
})
export class GameStore extends ComponentStore<GameState> {
  LOCAL_STORAGE_KEY = 'ng-2048-game-state';
  constructor() {
    super(INITIAL_STATE);
    this.loadStateFromStorage();
  }

  restart() {
    this.setState(INITIAL_STATE);
  }

  saveStateToStorage(state: GameState) {
    window.localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(state));
  }

  loadStateFromStorage() {
    const state = window.localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (!state) {
      return;
    }
    this.setState(JSON.parse(state));
  }

  private transpose = (m: Tile[][]) =>
    m[0].map((_, i) =>
      m.map((x) => {
        const tile = x[i];
        return new Tile(tile.value, { ...tile.meta });
      })
    );

  // *********** Updaters *********** //

  readonly setGameState = this.updater((state, value: GameStates) => ({
    ...state,
    gameState: value,
  }));

  readonly setScore = this.updater((state, value: number) => {
    if (value === 2048) {
      this.setGameState(GameStates.WIN);
    }
    return {
      ...state,
      score: state.score < value ? value : state.score || 0,
    };
  });

  readonly generateRandomNumber = this.updater((state) => {
    const emptyTiles: Tile[] = [];
    state.grid.forEach((row) => {
      row.forEach((tile) => {
        if (tile.value === 0) {
          emptyTiles.push(tile);
        }
      });
    });
    if (emptyTiles.length === 0) {
      this.setGameState(GameStates.LOSE);
      return state;
    }
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const { row, col } = emptyTiles[randomIndex].meta.position;
    return {
      ...state,
      grid: [
        ...state.grid.slice(0, row),
        [
          ...state.grid[row].slice(0, col),
          Math.random() > 0.9
            ? new Tile(4, {
                position: { row, col },
                isNew: true,
              })
            : new Tile(2, {
                position: { row, col },
                isNew: true,
              }),
          ...state.grid[row].slice(col + 1),
        ],
        ...state.grid.slice(row + 1),
      ],
    };
  });

  private transformGrid = (
    grid: Tile[][],
    { isTranspose = false, isReverse = false }
  ) => {
    for (
      let rowIndex = !isReverse ? 0 : grid.length - 1;
      !isReverse ? rowIndex < grid.length : rowIndex >= 0;
      !isReverse ? rowIndex++ : rowIndex--
    ) {
      const row = grid[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const tile = row[colIndex];
        if (tile.value === 0) {
          continue;
        }
        let nextColIndex = colIndex + (!isReverse ? 1 : -1);
        while (!isReverse ? nextColIndex < row.length : nextColIndex >= 0) {
          const nextTile = row[nextColIndex];
          if (nextTile.value === 0) {
            if (!isReverse) {
              nextColIndex++;
            } else {
              nextColIndex--;
            }
            continue;
          }
          if (tile.value === nextTile.value) {
            const newTile = new Tile(tile.value * 2, {
              position: {
                row: isTranspose ? nextColIndex : rowIndex,
                col: isTranspose ? rowIndex : nextColIndex,
              },
              merged: true,
            });
            grid[rowIndex][nextColIndex] = newTile;
            grid[rowIndex][colIndex] = new Tile(0, {
              position: {
                row: isTranspose ? colIndex : rowIndex,
                col: isTranspose ? rowIndex : colIndex,
              },
            });
            this.setScore(newTile.value);
            colIndex = nextColIndex;
          }
          break;
        }
      }
      const filtered = grid[rowIndex].filter((tile) => tile.value !== 0);
      const missing = 4 - filtered.length;
      const zeros = Array(missing).fill(
        new Tile(0, {
          position: { row: rowIndex, col: 0 },
        })
      );
      const combo = !isReverse
        ? [...zeros, ...filtered]
        : [...filtered, ...zeros];
      grid[rowIndex] = combo.map((tile, index) => {
        if (tile.value !== 0) {
          return new Tile(tile.value, {
            ...tile.meta,
            position: {
              row: isTranspose ? index : rowIndex,
              col: isTranspose ? rowIndex : index,
            },
          });
        }
        return new Tile(0, {
          ...tile.meta,
          position: {
            row: isTranspose ? index : rowIndex,
            col: isTranspose ? rowIndex : index,
          },
          isNew: false,
        });
      });
    }
    return grid;
  };

  readonly moveLeft = this.updater((state) => {
    const transformed = this.transformGrid([...state.grid], {
      isReverse: true,
    });
    return {
      ...state,
      grid: transformed,
    };
  });

  readonly moveRight = this.updater((state) => {
    const transformed = this.transformGrid([...state.grid], {});
    return {
      ...state,
      grid: transformed,
    };
  });

  readonly moveTop = this.updater((state) => {
    const transposed = this.transpose([...state.grid]);
    const transformed = this.transformGrid([...transposed], {
      isTranspose: true,
      isReverse: true,
    });
    const reverseTransposed = this.transpose(transformed);
    return {
      ...state,
      grid: reverseTransposed,
    };
  });

  readonly moveBottom = this.updater((state) => {
    const transposed = this.transpose([...state.grid]);
    const transformed = this.transformGrid([...transposed], {
      isTranspose: true,
    });
    const reverseTransposed = this.transpose(transformed);
    return {
      ...state,
      grid: reverseTransposed,
    };
  });

  // *********** Selectors *********** //

  readonly grid$ = this.select(({ grid }) => grid);

  readonly score$ = this.select(({ score }) => score);

  readonly gameState$ = this.select(({ gameState }) => gameState);

  readonly tiles$ = this.select(({ grid }) => {
    const tiles: Tile[] = [];
    grid.forEach((row) => {
      row.forEach((tile) => {
        if (tile.value === 0) {
          return;
        }
        tiles.push(tile);
      });
    });
    return tiles;
  });

  readonly vm$ = this.select((state) => ({
    grid: state.grid,
    score: state.score,
    gameState: state.gameState,
  }));
}
