import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './settings.entity';

const DEFAULTS: Record<string, string> = {
  site_name: "Min's Dev Blog",
  site_description: '배우고 기록하고 공유하기',
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  async onModuleInit() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      const exists = await this.settingRepo.findOne({ where: { key } });
      if (!exists) {
        await this.settingRepo.save({ key, value });
      }
    }
  }

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.settingRepo.find();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async update(key: string, value: string) {
    await this.settingRepo.save({ key, value });
    return { key, value };
  }
}
