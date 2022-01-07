import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameState, GameStore } from './game.store';
import Tile from './tile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  rows = 4;
  cols = 4;
  grid: Array<Array<number>> = [];
  vm$: Observable<GameState>;
  tiles$: Observable<Tile[]>;
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
  constructor(private store: GameStore) {
    this.vm$ = this.store.vm$;
    this.tiles$ = this.store.tiles$;
  }

  ngOnInit(): void {
    this.store.generateRandomNumber();
  }

  tileTrackByFn(index: number, tile: Tile) {
    return tile.meta.id;
  }

  trackByFn(index: number) {
    return index;
  }

  moveLeft() {
    this.store.moveLeft();
    this.store.generateRandomNumber();
  }
  moveRight() {
    this.store.moveRight();
    this.store.generateRandomNumber();
  }
  moveTop() {
    this.store.moveTop();
    this.store.generateRandomNumber();
  }
  moveBottom() {
    this.store.moveBottom();
    this.store.generateRandomNumber();
  }
}
