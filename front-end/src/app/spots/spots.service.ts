import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

@Injectable({ providedIn: 'root' })
export class SpotsService {
  constructor(private api: IDEAApiService) {}
}
