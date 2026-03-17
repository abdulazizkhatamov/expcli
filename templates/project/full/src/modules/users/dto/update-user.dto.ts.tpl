export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export function validateUpdateUserDto(
  data: unknown,
): { success: true; data: UpdateUserDto } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Body must be an object' };
  }

  const obj = data as Record<string, unknown>;
  const result: UpdateUserDto = {};

  if (obj['name'] !== undefined) {
    if (typeof obj['name'] !== 'string' || obj['name'].trim() === '') {
      return { success: false, error: 'name must be a non-empty string' };
    }
    result.name = obj['name'].trim();
  }

  if (obj['email'] !== undefined) {
    if (typeof obj['email'] !== 'string' || !obj['email'].includes('@')) {
      return { success: false, error: 'email must be a valid email' };
    }
    result.email = obj['email'].trim();
  }

  return { success: true, data: result };
}
