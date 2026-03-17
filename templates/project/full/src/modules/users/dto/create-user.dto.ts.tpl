export interface CreateUserDto {
  name: string;
  email: string;
}

export function validateCreateUserDto(
  data: unknown,
): { success: true; data: CreateUserDto } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Body must be an object' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj['name'] !== 'string' || obj['name'].trim() === '') {
    return { success: false, error: 'name is required and must be a string' };
  }

  if (typeof obj['email'] !== 'string' || !obj['email'].includes('@')) {
    return { success: false, error: 'email is required and must be a valid email' };
  }

  return {
    success: true,
    data: { name: obj['name'].trim(), email: obj['email'].trim() },
  };
}
