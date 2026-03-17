export interface Create__NAME_PASCAL__Dto {
  // TODO: define fields
}

export interface Update__NAME_PASCAL__Dto {
  // TODO: define fields
}

export function validateCreate__NAME_PASCAL__Dto(
  data: unknown,
): { success: true; data: Create__NAME_PASCAL__Dto } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Body must be an object' };
  }
  // TODO: add field validation
  return { success: true, data: data as Create__NAME_PASCAL__Dto };
}

export function validateUpdate__NAME_PASCAL__Dto(
  data: unknown,
): { success: true; data: Update__NAME_PASCAL__Dto } | { success: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'Body must be an object' };
  }
  // TODO: add field validation
  return { success: true, data: data as Update__NAME_PASCAL__Dto };
}
