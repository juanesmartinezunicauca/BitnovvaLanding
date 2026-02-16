import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ContactForm } from './components/contact-form/contact-form';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'contacto', component: ContactForm },
    { path: '**', redirectTo: '' }
];

