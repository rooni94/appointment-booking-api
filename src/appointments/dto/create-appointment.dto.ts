import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'a3b5df8c-9f34-4ed5-a9a8-2e12221bb291' })
  @IsUUID()
  resourceId: string;

  @ApiProperty({ example: 'Ramazan' })
  @IsString()
  @IsNotEmpty()
  customer: string;

  @ApiProperty({ example: '2026-10-01T10:00:00.000Z' })
  @IsISO8601()
  startAt: string;

  @ApiProperty({ example: '2026-10-01T11:00:00.000Z' })
  @IsISO8601()
  endAt: string;
}
