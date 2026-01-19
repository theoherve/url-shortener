import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';
import type { Url } from '@prisma/client';

const SHORT_CODE_LENGTH = 6;

@Injectable()
export class UrlService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a shortened URL
   * Uses nanoid for collision-resistant, URL-safe short codes
   */
  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    const shortCode = nanoid(SHORT_CODE_LENGTH);

    return this.prisma.url.create({
      data: {
        shortCode,
        originalUrl: createUrlDto.originalUrl,
      },
    });
  }

  /**
   * Finds a URL by its short code
   * @throws NotFoundException if the short code doesn't exist
   */
  async findByShortCode(shortCode: string): Promise<Url> {
    const url = await this.prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    return url;
  }

  /**
   * Lists all URLs, ordered by creation date (newest first)
   */
  async findAll(): Promise<{ urls: Url[]; total: number }> {
    const [urls, total] = await Promise.all([
      this.prisma.url.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // Simple limit for MVP
      }),
      this.prisma.url.count(),
    ]);

    return { urls, total };
  }
}
