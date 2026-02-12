import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { throttleTime, map } from 'rxjs/operators';

export interface CursorPosition {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root',
})
export class CursorTracker {
  private cursorPosition$ = new BehaviorSubject<CursorPosition>({ x: 0, y: 0 });

  constructor() {
    if (typeof window !== 'undefined') {
      fromEvent<MouseEvent>(window, 'mousemove')
        .pipe(
          throttleTime(16), // ~60fps
          map(event => ({ x: event.clientX, y: event.clientY }))
        )
        .subscribe(position => this.cursorPosition$.next(position));
    }
  }

  getCursorPosition(): Observable<CursorPosition> {
    return this.cursorPosition$.asObservable();
  }

  getCurrentPosition(): CursorPosition {
    return this.cursorPosition$.value;
  }
}
