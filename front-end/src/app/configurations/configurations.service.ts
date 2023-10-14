import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { Configuration } from '@models/configuration.model';

@Injectable({ providedIn: 'root' })
export class ConfigurationsService {
  constructor(private api: IDEAApiService) {}
}
