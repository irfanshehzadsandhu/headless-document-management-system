import { PaginationOptions, PaginatedResponse } from '../types/index.js';

export function parsePaginationOptions(query: Record<string, string | undefined>): PaginationOptions {
  return {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 10,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

