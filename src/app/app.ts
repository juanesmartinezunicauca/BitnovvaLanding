import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CursorTracker } from './services/cursor-tracker';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { About } from './components/about/about';
import { Team } from './components/team/team';
import { Projects } from './components/projects/projects';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    Hero,
    About,
    Team,
    Projects,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('BitNovva');

  constructor(private cursorTracker: CursorTracker) { }
}
