import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private rolesService: RolesService,
  ) {}

  private sanitize(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      sellerStatus: user.sellerStatus,
      sellerProfile: user.sellerProfile,
      addresses: user.addresses,
      photoURL: user.photoURL,
      bio: user.bio,
      country: user.country,
      city: user.city,
      blocked: user.blocked,
      customRoleId: user.customRoleId,
      customRole: user.customRole ? { id: user.customRole.id, name: user.customRole.name } : null,
      createdAt: user.createdAt,
    };
  }

  async findAll() {
    const users = await this.usersRepo.find({ order: { createdAt: 'DESC' }, relations: ['customRole'] });
    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['customRole'] });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitize(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    Object.assign(user, dto);
    return this.sanitize(await this.usersRepo.save(user));
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.role = dto.role;
    return this.sanitize(await this.usersRepo.save(user));
  }

  async assignCustomRole(id: string, roleId: string | null) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (roleId) await this.rolesService.findOne(roleId); // 404 si le rôle n'existe pas
    user.customRoleId = roleId;
    const saved = await this.usersRepo.save(user);
    return this.findOne(saved.id);
  }
}
