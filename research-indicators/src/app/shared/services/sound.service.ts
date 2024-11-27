import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio();
  }

  playCreationAudio(): void {
    this.audio.src = 'sounds/creation.mp3';
    this.audio.load();
    this.audio.play();
  }

  playLoginAudio(): void {
    this.audio.src = 'sounds/login.mp3';
    this.audio.load();
    this.audio.play();
  }
}
