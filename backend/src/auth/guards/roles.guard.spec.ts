import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createContext(user: { role: string } | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('autorise si aucun rôle requis', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createContext({ role: 'customer' }))).toBe(true);
  });

  it("refuse un customer sur une route admin", () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(createContext({ role: 'customer' }))).toThrow(ForbiddenException);
  });

  it('autorise un admin sur une route admin', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createContext({ role: 'admin' }))).toBe(true);
  });

  it('refuse si aucun utilisateur sur une route protégée', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(ForbiddenException);
  });
});
