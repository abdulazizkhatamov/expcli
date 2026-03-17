import { randomUUID } from 'crypto';
import type { __NAME_PASCAL__ } from './__NAME_KEBAB__.types.js';

export class __NAME_PASCAL__Service {
  // In-memory store — replace with your preferred ORM or data layer.
  private readonly store = new Map<string, __NAME_PASCAL__>();

  findAll(): __NAME_PASCAL__[] {
    return Array.from(this.store.values());
  }

  findById(id: string): __NAME_PASCAL__ {
    const item = this.store.get(id);
    if (!item) throw Object.assign(new Error(`__NAME_PASCAL__ with id '${id}' not found`), { statusCode: 404 });
    return item;
  }

  create(data: Omit<__NAME_PASCAL__, 'id' | 'createdAt' | 'updatedAt'>): __NAME_PASCAL__ {
    const now = new Date().toISOString();
    const item: __NAME_PASCAL__ = { id: randomUUID(), ...data, createdAt: now, updatedAt: now } as __NAME_PASCAL__;
    this.store.set(item.id, item);
    return item;
  }

  update(id: string, data: Partial<Omit<__NAME_PASCAL__, 'id' | 'createdAt' | 'updatedAt'>>): __NAME_PASCAL__ {
    const item = this.findById(id);
    const updated: __NAME_PASCAL__ = { ...item, ...data, updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.findById(id);
    this.store.delete(id);
  }
}
