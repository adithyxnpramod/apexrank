import { ApiClient } from './client';
import { HttpApiClient } from './httpApi';
import { MockApiClient } from './mockApi';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export const api: ApiClient = useMocks ? new MockApiClient() : new HttpApiClient();

export * from './client';
export * from './types';
