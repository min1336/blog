import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Body() body: Record<string, string>) {
    const updates = Object.entries(body).map(([key, value]) =>
      this.settingsService.update(key, value),
    );
    return Promise.all(updates);
  }
}
