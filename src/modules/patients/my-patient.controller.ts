import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('my-patient')
@UseGuards(AuthGuard('jwt-access'))
export class MyPatientController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMyPatientRecord(
    @Request() req,
    @Body() createPatientDto: Omit<CreatePatientDto, 'userId'>,
  ) {
    const patientData: CreatePatientDto = {
      ...createPatientDto,
      userId: req.user.id,
    };
    return this.patientsService.create(patientData);
  }

  @Get()
  async getMyPatientRecord(@Request() req) {
    try {
      return await this.patientsService.findByUserId(req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          data: null,
          message: 'No patient record found. Please create one.',
        };
      }
      throw error;
    }
  }

  @Patch()
  updateMyPatientRecord(
    @Request() req,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.updateByUserId(req.user.id, updatePatientDto);
  }
}
