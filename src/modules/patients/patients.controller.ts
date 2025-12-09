import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../admins/guards/roles.guard';
import { Roles } from '../admins/decorator/roles.decorator';
import { CheckPermission } from '../admins/decorator/check-permission.decorator';

@Controller('admin/patients')
@UseGuards(AuthGuard('admin-jwt'), RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('Super Admin', 'Admin')
  @CheckPermission({ resource: 'patients', level: 2 })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @Roles('Super Admin', 'Admin')
  @CheckPermission({ resource: 'patients', level: 1 })
  findAll(@Query() query: PatientQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get('stats')
  @Roles('Super Admin', 'Admin')
  @CheckPermission({ resource: 'patients', level: 1 })
  getStats() {
    return this.patientsService.getStats();
  }

  @Get(':id')
  @Roles('Super Admin', 'Admin')
  @CheckPermission({ resource: 'patients', level: 1 })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Admin')
  @CheckPermission({ resource: 'patients', level: 3 })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @CheckPermission({ resource: 'patients', level: 4 })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
