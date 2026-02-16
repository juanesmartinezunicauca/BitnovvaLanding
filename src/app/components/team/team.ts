import { Component } from '@angular/core';
import { Avatar3d } from './avatar-3d/avatar-3d';

interface TeamMember {
  name: string;
  role: string;
  skills: string[];
  color: string;
  shape: 'cube' | 'sphere' | 'torus' | 'icosahedron';
  delay: string;
  modelUrl?: string;
}

@Component({
  selector: 'app-team',
  imports: [Avatar3d],
  templateUrl: './team.html',
  styleUrl: './team.scss',
  standalone: true
})
export class Team {
  teamMembers: TeamMember[] = [
    {
      name: 'Ana Sofia Arango',
      role: 'Lider de proyecto',
      skills: ['Java', 'HTML', 'DevOps'],
      color: '#ff0055', // Neon Pink
      shape: 'icosahedron',
      delay: '0.2s',
      modelUrl: '/models/Sofia arango.glb'
    },
    {
      name: 'Juan Esteban Martinez',
      role: 'Web Master Developer',
      skills: ['React', 'Node.js', 'Python'],
      color: '#00f0ff', // Neon Blue
      shape: 'torus',
      delay: '0s',
      modelUrl: '/models/juan-esteban.glb'
    },
    {
      name: 'Juan Esteban Chavez',
      role: 'Moderador',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      color: '#ccff00', // Acid Green
      shape: 'sphere',
      delay: '0.4s',
      modelUrl: '/models/Juan Chavez.glb'
    },
    {
      name: 'Juan Diego Perez',
      role: 'Interventor de proyecto',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      color: '#ccff00', // Acid Green
      shape: 'cube',
      delay: '0.4s',
      modelUrl: '/models/Juan Diego.glb'
    },
    {
      name: 'Cristian Camilo Unas',
      role: 'Secretario de Proyecto',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      color: '#ffaa00', // Neon Amber
      shape: 'icosahedron',
      delay: '0.4s',
      modelUrl: '/models/cristian-camilo.glb'
    }

  ];
}
