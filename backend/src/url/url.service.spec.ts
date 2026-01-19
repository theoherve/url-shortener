import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock nanoid to return predictable values for testing
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'abc123'),
}));

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    url: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a shortened URL with a generated shortCode', async () => {
      const createUrlDto = { originalUrl: 'https://example.com/long-url' };
      const expectedUrl = {
        id: '123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com/long-url',
        createdAt: new Date(),
      };

      mockPrismaService.url.create.mockResolvedValue(expectedUrl);

      const result = await service.create(createUrlDto);

      expect(result).toEqual(expectedUrl);
      expect(mockPrismaService.url.create).toHaveBeenCalledWith({
        data: {
          shortCode: 'abc123',
          originalUrl: createUrlDto.originalUrl,
        },
      });
    });

    it('should generate a 6-character shortCode', async () => {
      const createUrlDto = { originalUrl: 'https://example.com' };

      mockPrismaService.url.create.mockResolvedValue({
        id: '123',
        shortCode: 'abc123',
        originalUrl: createUrlDto.originalUrl,
        createdAt: new Date(),
      });

      await service.create(createUrlDto);

      expect(mockPrismaService.url.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shortCode: expect.stringMatching(/^[a-zA-Z0-9_-]{6}$/),
          }),
        }),
      );
    });
  });

  describe('findByShortCode', () => {
    it('should return a URL when found', async () => {
      const expectedUrl = {
        id: '123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        createdAt: new Date(),
      };

      mockPrismaService.url.findUnique.mockResolvedValue(expectedUrl);

      const result = await service.findByShortCode('abc123');

      expect(result).toEqual(expectedUrl);
      expect(mockPrismaService.url.findUnique).toHaveBeenCalledWith({
        where: { shortCode: 'abc123' },
      });
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.findByShortCode('notfound')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all URLs with total count', async () => {
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

      mockPrismaService.url.findMany.mockResolvedValue(urls);
      mockPrismaService.url.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result).toEqual({ urls, total: 2 });
      expect(mockPrismaService.url.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should return empty array when no URLs exist', async () => {
      mockPrismaService.url.findMany.mockResolvedValue([]);
      mockPrismaService.url.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result).toEqual({ urls: [], total: 0 });
    });
  });
});
