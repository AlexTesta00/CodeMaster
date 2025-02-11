export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const transform = {
  '^.+\\.(ts|tsx)$': ['ts-jest', {
    tsconfig: 'tsconfig.json'
  }],
};