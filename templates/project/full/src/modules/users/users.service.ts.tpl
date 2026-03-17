import { randomUUID } from 'crypto';
import { HttpException } from '../../common/errors/http-exception.js';
import type { User } from './users.types.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

// @expcli:imports

export class UsersService {
  // In-memory store — run `expcli add prisma` (or another ORM) to replace this.
  private readonly store = new Map<string, User>();

  findAll(): User[] {
    return Array.from(this.store.values());
  }

  findById(id: string): User {
    const user = this.store.get(id);
    if (!user) throw HttpException.notFound(`User with id '${id}' not found`);
    return user;
  }

  create(dto: CreateUserDto): User {
    const existing = Array.from(this.store.values()).find((u) => u.email === dto.email);
    if (existing) throw HttpException.conflict(`Email '${dto.email}' is already in use`);

    const now = new Date().toISOString();
    const user: User = { id: randomUUID(), ...dto, createdAt: now, updatedAt: now };
    this.store.set(user.id, user);
    return user;
  }

  update(id: string, dto: UpdateUserDto): User {
    const user = this.findById(id);
    const updated: User = { ...user, ...dto, updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.findById(id); // throws 404 if not found
    this.store.delete(id);
  }
}
