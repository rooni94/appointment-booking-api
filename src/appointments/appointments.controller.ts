import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an appointment' })
  @ApiCreatedResponse({ description: 'Appointment created', type: AppointmentResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid appointment data or time range' })
  @ApiConflictResponse({ description: 'The requested time overlaps another appointment' })
  create(@Body() dto: CreateAppointmentDto) { return this.appointments.create(dto); }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Appointment found', type: AppointmentResponseDto })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  findOne(@Param('id') id: string) { return this.appointments.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Appointment updated', type: AppointmentResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid appointment data or state' })
  @ApiConflictResponse({ description: 'The new time overlaps another appointment' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) { return this.appointments.update(id, dto); }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Appointment cancelled', type: AppointmentResponseDto })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  cancel(@Param('id') id: string) { return this.appointments.cancel(id); }
}
