import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';
import { UserProfile } from '@models/userProfile.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: IDEAApiService) {}

  /**
   * Updates a profile.
   * ! Only for externals currently
   */
  async updateProfile(profile: UserProfile): Promise<void> {
    await this.api.putResource(['externals', profile.userId], { body: profile });
  }

  /**
   * Deletes a profile.
   */
  async deleteProfile(profile: UserProfile): Promise<void> {
    await this.api.deleteResource([profile.isExternal ? 'externals' : 'esners', profile.userId]);
  }

  /**
   * Sets the image URI for the avatar.
   */
  async setImageURI(profile: UserProfile, file: File): Promise<string> {
    const { url, id } = await this.api.patchResource([profile.isExternal ? 'externals' : 'esners'], {
      body: { action: 'GET_IMAGE_UPLOAD_URL' }
    });

    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

    return id;
  }
}
