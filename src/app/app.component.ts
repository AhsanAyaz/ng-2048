import { Component, HostListener, OnInit } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { GameState, GameStates, GameStore } from './game.store';
import Tile from './tile';
import * as confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  infoOpen = false;
  rows = 4;
  cols = 4;
  grid: Array<Array<number>> = [];
  score$!: Observable<number>;
  grid$!: Observable<Tile[][]>;
  tiles$!: Observable<Tile[]>;
  gameState$!: Observable<GameStates>;
  gameStates = GameStates;
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.moveLeft();
        break;
      case 'ArrowRight':
        this.moveRight();
        break;
      case 'ArrowUp':
        this.moveTop();
        break;
      case 'ArrowDown':
        this.moveBottom();
        break;
      default:
        break;
    }
  }
  constructor(private store: GameStore) {}

  onWin() {
    this.showConfetti();
  }

  toggleInfo() {
    this.infoOpen = !this.infoOpen;
  }

  async showConfetti() {
    const myConfetti = confetti.create(
      document.querySelector('canvas') as HTMLCanvasElement,
      { resize: true }
    );
    for (let i = 1; i <= 3; i++) {
      setTimeout(() => {
        new Array(5).fill(0).map(() =>
          myConfetti({
            angle: this.random(60, 120),
            spread: this.random(10, 50),
            particleCount: this.random(40, 50),
            origin: {
              y: 0.6,
            },
          })
        );
      }, 750 * i);
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  ngOnInit(): void {
    this.tiles$ = this.store.tiles$;
    this.score$ = this.store.score$;
    this.grid$ = this.store.grid$;
    this.gameState$ = this.store.gameState$;
    this.gameState$.pipe(delay(200)).subscribe((gameState: GameStates) => {
      if (gameState !== GameStates.WIN) {
        return;
      }
      this.onWin();
    });
    this.store.vm$.subscribe((state: GameState) => {
      this.store.saveStateToStorage(state);
    });
  }

  tileTrackByFn(_: number, tile: Tile) {
    return tile.meta.id;
  }

  trackByFn(index: number) {
    return index;
  }

  restart() {
    this.store.restart();
  }

  @HostListener('swipeleft', ['$event']) moveLeft() {
    this.store.moveLeft();
    this.store.generateRandomNumber();
  }
  @HostListener('swiperight', ['$event']) moveRight() {
    this.store.moveRight();
    this.store.generateRandomNumber();
  }
  @HostListener('swipeup', ['$event']) moveTop() {
    this.store.moveTop();
    this.store.generateRandomNumber();
  }
  @HostListener('swipedown', ['$event']) moveBottom() {
    this.store.moveBottom();
    this.store.generateRandomNumber();
  }
}
