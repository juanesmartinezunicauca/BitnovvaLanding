import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArcadeGame } from '../arcade-game/arcade-game';

@Component({
  selector: 'app-hero',
  imports: [ArcadeGame, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  standalone: true
})
export class Hero {

}
