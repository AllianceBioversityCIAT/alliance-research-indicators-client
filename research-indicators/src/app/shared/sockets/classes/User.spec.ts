import { User } from './User';

describe('User', () => {
  it('debe crear una instancia correctamente con valores válidos', () => {
    const user = new User('Juan', 123);
    expect(user.name).toBe('Juan');
    expect(user.userId).toBe(123);
  });

  it('debe permitir userId nulo', () => {
    const user = new User('Ana', null as any);
    expect(user.name).toBe('Ana');
    expect(user.userId).toBeNull();
  });

  it('debe permitir userId 0', () => {
    const user = new User('Cero', 0);
    expect(user.name).toBe('Cero');
    expect(user.userId).toBe(0);
  });
});
