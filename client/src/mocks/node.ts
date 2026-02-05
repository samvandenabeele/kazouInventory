import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup the server for testing with the provided handlers
export const server = setupServer(...handlers);
