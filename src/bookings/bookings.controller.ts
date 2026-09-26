import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingResponseDto } from '../dto/booking.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { ErrorResponseDto } from '../dto/error.dto';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a booking',
    description: 'Books one predefined slot. Customer fields are trimmed before validation and storage. No authentication is required.',
  })
  @ApiCreatedResponse({ type: BookingResponseDto })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: missing or invalid input, including malformed JSON.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'SLOT_NOT_FOUND: valid UUID for a slot that does not exist.', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'SLOT_UNAVAILABLE: the slot already has an active booking.', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'INTERNAL_ERROR: unexpected server error.', type: ErrorResponseDto })
  create(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }

  @Delete(':bookingId')
  @ApiOperation({
    summary: 'Cancel a booking',
    description: 'Cancellation is idempotent. Repeating it returns the same cancelled booking without changing a newer booking or emitting another event. No authentication is required.',
  })
  @ApiParam({ name: 'bookingId', format: 'uuid', required: true })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiBadRequestResponse({ description: 'VALIDATION_ERROR: bookingId is not a valid UUID.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'BOOKING_NOT_FOUND: valid UUID for a booking that does not exist.', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'INTERNAL_ERROR: unexpected server error.', type: ErrorResponseDto })
  cancel(@Param('bookingId', new ParseUUIDPipe()) id: string) {
    return this.bookings.cancel(id);
  }
}
