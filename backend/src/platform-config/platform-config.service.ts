import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformConfig } from './entities/platform-config.entity';
import { UpdatePlatformConfigDto } from './dto/platform-config.dto';

export interface PlatformConfigMap {
  commissionRate: number;
  sellerRegistrationEnabled: boolean;
}

@Injectable()
export class PlatformConfigService {
  constructor(@InjectRepository(PlatformConfig) private configRepo: Repository<PlatformConfig>) {}

  async getAll(): Promise<PlatformConfigMap> {
    const rows = await this.configRepo.find();
    const map: Partial<PlatformConfigMap> = {};
    for (const row of rows) {
      (map as Record<string, unknown>)[row.key] = row.value;
    }
    return {
      commissionRate: (map.commissionRate as number) ?? 10,
      sellerRegistrationEnabled: (map.sellerRegistrationEnabled as boolean) ?? true,
    };
  }

  async getValue<K extends keyof PlatformConfigMap>(key: K): Promise<PlatformConfigMap[K]> {
    const config = await this.getAll();
    return config[key];
  }

  async update(dto: UpdatePlatformConfigDto): Promise<PlatformConfigMap> {
    const entries = Object.entries(dto).filter(([, v]) => v !== undefined);
    for (const [key, value] of entries) {
      await this.configRepo.upsert({ key, value }, ['key']);
    }
    return this.getAll();
  }
}
