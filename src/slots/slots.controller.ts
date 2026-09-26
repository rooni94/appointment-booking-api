import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error.dto';
import { SlotsResponseDto } from '../dto/slot.dto';
import { SlotsService } from './slots.service';

@ApiTags('slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly slots: SlotsService) {}

  @Get()
  @ApiOperation({
    summary: 'List available slots',
    description: 'Returns only slots without an active booking, ordered by startsAt then id. No authentication is required.',
  })
  @ApiOkResponse({ type: SlotsResponseDto })
  @ApiResponse({ status: 500, description: 'INTERNAL_ERROR: unexpected server error.', type: ErrorResponseDto })
  list() {
    return this.slots.available();
  }
}
