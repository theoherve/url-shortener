import { IsUrl, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Invalid URL format. Must start with http:// or https://' },
  )
  @MaxLength(2048, { message: 'URL must not exceed 2048 characters' })
  originalUrl: string;
}
