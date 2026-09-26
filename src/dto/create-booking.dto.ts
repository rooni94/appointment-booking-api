import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateBookingDto {
  @ApiProperty({ format: 'uuid', example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  slotId: string;

  @ApiProperty({ minLength: 1, example: 'Alex Morgan', description: 'Leading and trailing whitespace is removed before validation and storage.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ format: 'email', example: 'alex@example.com', description: 'Leading and trailing whitespace is removed before validation and storage.' })
  @Transform(trim)
  @IsString()
  @IsEmail()
  customerEmail: string;
}
