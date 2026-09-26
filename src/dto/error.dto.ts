import { ApiProperty } from '@nestjs/swagger';

class ErrorBodyDto {
  @ApiProperty({
    enum: ['VALIDATION_ERROR', 'SLOT_NOT_FOUND', 'SLOT_UNAVAILABLE', 'BOOKING_NOT_FOUND', 'INTERNAL_ERROR'],
    example: 'VALIDATION_ERROR',
  })
  code: string;

  @ApiProperty({ example: 'Invalid request.' })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ type: ErrorBodyDto })
  error: ErrorBodyDto;
}
