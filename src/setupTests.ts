import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock Firebase (to avoid real Firebase calls in tests)
vi.mock('./services/firebase', () => ({
    auth: {
        currentUser: null,
        signInWithEmailAndPassword: vi.fn(),
        createUserWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
    },
    db: {},
    appId: 'test-app-id',
}));

// Mock sound effects
vi.mock('./utils/sounds', () => ({
    playSound: vi.fn(),
    playAddSound: vi.fn(),
    playRemoveSound: vi.fn(),
    playSuccessSound: vi.fn(),
    playErrorSound: vi.fn(),
}));
