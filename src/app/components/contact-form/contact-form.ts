import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-contact-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-form.html',
    styleUrl: './contact-form.scss'
})
export class ContactForm {
    name: string = '';
    email: string = '';
    subject: string = '';
    description: string = '';

    onSubmit() {
        const body = `Nombre: ${this.name}\nCorreo de contacto: ${this.email}\n\nDescripción:\n${this.description}`;
        const mailtoLink = `mailto:info@bitnovva.com?subject=${encodeURIComponent(this.subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    goBack() {
        window.history.back();
    }
}
