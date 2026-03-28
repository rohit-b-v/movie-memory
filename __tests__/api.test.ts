import { api, ApiError } from '@/lib/api';

global.fetch = jest.fn();

describe('API Client Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an ApiError with status 401 on unauthorized access', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(api.get('/api/me')).rejects.toThrow(ApiError);
    await expect(api.get('/api/me')).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('should throw an ApiError with status 500 on server failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    await expect(api.post('/api/fact', {})).rejects.toThrow(ApiError);
    await expect(api.post('/api/fact', {})).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });
  });

  it('should fallback to a default error message if parsing fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => { throw new Error('Failed to parse JSON'); },
    });

    await expect(api.get('/api/fact')).rejects.toMatchObject({
      status: 502,
      message: 'An unexpected error occurred',
    });
  });
});