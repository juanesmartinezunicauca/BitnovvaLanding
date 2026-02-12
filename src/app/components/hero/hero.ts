import { Component } from '@angular/core';
import { ArcadeGame } from '../arcade-game/arcade-game';

@Component({
  selector: 'app-hero',
  imports: [ArcadeGame],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  standalone: true
})
export class Hero {

}
