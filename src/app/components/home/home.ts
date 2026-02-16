import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { About } from '../about/about';
import { Team } from '../team/team';
import { Projects } from '../projects/projects';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        Hero,
        About,
        Team,
        Projects
    ],
    templateUrl: './home.html'
})
export class Home { }
