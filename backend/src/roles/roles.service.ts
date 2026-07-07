import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto, UpdateRoleDto, assertValidPermissions } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private rolesRepo: Repository<Role>) {}

  findAll() {
    return this.rolesRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Rôle introuvable');
    return role;
  }

  async create(dto: CreateRoleDto) {
    try {
      assertValidPermissions(dto.permissions);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
    const existing = await this.rolesRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Un rôle avec ce nom existe déjà');

    const role = this.rolesRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      permissions: dto.permissions,
    });
    return this.rolesRepo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem && dto.name !== undefined && dto.name !== role.name) {
      throw new ForbiddenException('Ce rôle de base ne peut pas être renommé');
    }
    if (dto.permissions !== undefined) {
      try {
        assertValidPermissions(dto.permissions);
      } catch (err) {
        throw new BadRequestException((err as Error).message);
      }
      role.permissions = dto.permissions;
    }
    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    return this.rolesRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new ForbiddenException('Ce rôle de base ne peut pas être supprimé');
    await this.rolesRepo.remove(role);
    return { deleted: true };
  }
}
