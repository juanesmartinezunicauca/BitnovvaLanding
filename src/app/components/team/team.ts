import { Component } from '@angular/core';
import { SkillRadar } from '../skill-radar/skill-radar';

@Component({
  selector: 'app-team',
  imports: [SkillRadar],
  templateUrl: './team.html',
  styleUrl: './team.scss',
  standalone: true
})
export class Team {

}
