import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { ConfigService } from '@nestjs/config';

@Controller()
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /api/urls - Create a shortened URL
   */
  @Post('urls')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUrlDto: CreateUrlDto) {
    const url = await this.urlService.create(createUrlDto);
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    return {
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      shortUrl: `${appUrl}/${url.shortCode}`,
      createdAt: url.createdAt,
    };
  }

  /**
   * GET /api/urls - List all URLs (dashboard)
   */
  @Get('urls')
  async findAll() {
    const { urls, total } = await this.urlService.findAll();
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    return {
      urls: urls.map((url) => ({
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        shortUrl: `${appUrl}/${url.shortCode}`,
        createdAt: url.createdAt,
      })),
      total,
    };
  }

  /**
   * GET /:shortCode - Redirect to original URL
   * Uses HTTP 302 (temporary redirect) to allow future tracking
   */
  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    // Validate shortCode format (alphanumeric, 6 chars)
    if (!/^[a-zA-Z0-9_-]{6}$/.test(shortCode)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Short URL not found',
      });
    }

    const url = await this.urlService.findByShortCode(shortCode);
    return res.redirect(HttpStatus.FOUND, url.originalUrl);
  }
}
