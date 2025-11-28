import { Test, TestingModule } from '@nestjs/testing';
import { AutoTaggingService } from './auto-tagging.service';
import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';

//  Mock Axios globally
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AutoTaggingService', () => {
  let service: AutoTaggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoTaggingService],
    }).compile();

    service = module.get<AutoTaggingService>(AutoTaggingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- TEST 1: HAPPY PATH ---
  describe('generateTags', () => {
    it('should scrape title/description and return extracted tags', async () => {
      // Setup Mock HTML Response
      const mockHtml = `
        <html>
          <head>
            <title>NestJS Framework</title>
            <meta name="description" content="A progressive Node.js framework for building efficient server-side applications." />
          </head>
        </html>
      `;

      const mockResponse: Partial<AxiosResponse> = {
        data: mockHtml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        } as InternalAxiosRequestConfig,
      };

      // Tell axios: "When someone calls .get, return this HTML"
      mockedAxios.get.mockResolvedValue(mockResponse as AxiosResponse);

      // Run the function
      const result = await service.generateTags('https://nestjs.com');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get as jest.Mock).toHaveBeenCalledWith(
        'https://nestjs.com',
        expect.anything(),
      );

      // Verify Scraper worked
      expect(result.title).toBe('NestJS Framework');

      // Verify NLP (Keyword Extractor) worked
      expect(result.tags).toEqual(
        expect.arrayContaining(['framework', 'nodejs']),
      );
    });
  });

  // --- TEST 2: SAD PATH (Scraping Fails) ---
  describe('Error Handling', () => {
    it('should return empty title and empty tags if scraping fails', async () => {
      // Mock Axios Error
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      // Run function
      const result = await service.generateTags('https://bad-url.com');

      // Assertions
      expect(result.title).toBe('');
      expect(result.tags).toEqual(['uncategorized']);
    });
  });

  // --- TEST 3: EMPTY CONTENT ---
  describe('Empty Content', () => {
    it('should handle websites with no relevant text', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: '<html><head></head><body></body></html>',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        } as InternalAxiosRequestConfig,
      };

      mockedAxios.get.mockResolvedValue(mockResponse as AxiosResponse);

      const result = await service.generateTags('https://empty.com');

      expect(result.title).toBe('');
      expect(result.tags).toEqual(['uncategorized']);
    });
  });
});
