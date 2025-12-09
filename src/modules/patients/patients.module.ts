import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { MyPatientController } from './my-patient.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController, MyPatientController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
