import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  const mockUrlService = {
    create: jest.fn(),
    findByShortCode: jest.fn(),
    findAll: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /urls (create)', () => {
    it('should create a shortened URL and return with shortUrl', async () => {
      const createUrlDto = { originalUrl: 'https://example.com/long-url' };
      const createdUrl = {
        id: '123',
        shortCode: 'abc123',
        originalUrl: createUrlDto.originalUrl,
        createdAt: new Date(),
      };

      mockUrlService.create.mockResolvedValue(createdUrl);

      const result = await controller.create(createUrlDto);

      expect(result).toEqual({
        id: createdUrl.id,
        shortCode: createdUrl.shortCode,
        originalUrl: createdUrl.originalUrl,
        shortUrl: 'http://localhost:3000/abc123',
        createdAt: createdUrl.createdAt,
      });
      expect(mockUrlService.create).toHaveBeenCalledWith(createUrlDto);
    });
  });

  describe('GET /urls (findAll)', () => {
    it('should return all URLs with shortUrl', async () => {
      const urls = [
        {
          id: '1',
          shortCode: 'abc123',
          originalUrl: 'https://example1.com',
          createdAt: new Date(),
        },
        {
          id: '2',
          shortCode: 'def456',
          originalUrl: 'https://example2.com',
          createdAt: new Date(),
        },
      ];

      mockUrlService.findAll.mockResolvedValue({ urls, total: 2 });

      const result = await controller.findAll();

      expect(result.total).toBe(2);
      expect(result.urls).toHaveLength(2);
      expect(result.urls[0].shortUrl).toBe('http://localhost:3000/abc123');
      expect(result.urls[1].shortUrl).toBe('http://localhost:3000/def456');
    });
  });

  describe('GET /:shortCode (redirect)', () => {
    it('should redirect to original URL with 302 status', async () => {
      const url = {
        id: '123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        createdAt: new Date(),
      };

      mockUrlService.findByShortCode.mockResolvedValue(url);

      const mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.redirect('abc123', mockResponse as any);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        url.originalUrl,
      );
    });

    it('should return 404 for invalid shortCode format', async () => {
      const mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.redirect('invalid!', mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Short URL not found',
      });
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockUrlService.findByShortCode.mockRejectedValue(
        new NotFoundException('Short URL not found'),
      );

      const mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await expect(
        controller.redirect('abc123', mockResponse as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
