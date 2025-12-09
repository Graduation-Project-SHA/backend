import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly patientSelectFields = {
    id: true,
    userId: true,
    medicalRecord: true,
    bloodType: true,
    allergies: true,
    chronicDiseases: true,
    emergencyContact: true,
    emergencyPhone: true,
    height: true,
    weight: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        gender: true,
        address: true,
        profileImage: true,
      },
    },
  };

  async create(createPatientDto: CreatePatientDto) {
    const { userId, ...patientData } = createPatientDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    if (user.role !== 'Patient') {
      throw new BadRequestException('User must have Patient role');
    }

    const existingPatient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (existingPatient) {
      throw new ConflictException(
        'Patient record already exists for this user',
      );
    }

    const patient = await this.prisma.patient.create({
      data: {
        userId,
        ...patientData,
      },
      select: this.patientSelectFields,
    });

    return {
      message: 'Patient record created successfully',
      data: patient,
    };
  }

  async findAll(query: PatientQueryDto) {
    const {
      search,
      bloodType,
      page = 1,
      limit = 10,
      sortBy = 'desc' as const,
      sortField = 'createdAt',
    } = query;

    const where: any = {
      user: {
        deletedAt: null,
      },
    };

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (bloodType) {
      where.bloodType = bloodType;
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortField]: sortBy };

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.patientSelectFields,
      }),
      this.prisma.patient.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: patients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      select: this.patientSelectFields,
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }

    return {
      data: patient,
    };
  }

  async findByUserId(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      select: this.patientSelectFields,
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient record not found for user "${userId}"`,
      );
    }

    return {
      data: patient,
    };
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPatient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }

    const patient = await this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
      select: this.patientSelectFields,
    });

    return {
      message: 'Patient record updated successfully',
      data: patient,
    };
  }

  async updateByUserId(userId: string, updatePatientDto: UpdatePatientDto) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existingPatient) {
      throw new NotFoundException(
        `Patient record not found for user "${userId}"`,
      );
    }

    return this.update(existingPatient.id, updatePatientDto);
  }

  async remove(id: string) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingPatient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }

    await this.prisma.patient.delete({
      where: { id },
    });

    return {
      message: `Patient record for "${existingPatient.user.name}" has been deleted successfully`,
    };
  }

  async getStats() {
    const [totalPatients, patientsWithMedicalRecords, bloodTypeStats] =
      await this.prisma.$transaction([
        this.prisma.patient.count({
          where: {
            user: {
              deletedAt: null,
            },
          },
        }),
        this.prisma.patient.count({
          where: {
            medicalRecord: {
              not: null,
            },
            user: {
              deletedAt: null,
            },
          },
        }),
        this.prisma.patient.groupBy({
          by: ['bloodType'],
          where: {
            bloodType: {
              not: null,
            },
            user: {
              deletedAt: null,
            },
          },
          _count: true,
        }),
      ]);

    return {
      totalPatients,
      patientsWithMedicalRecords,
      patientsWithoutMedicalRecords: totalPatients - patientsWithMedicalRecords,
      bloodTypeDistribution: bloodTypeStats.map((stat) => ({
        bloodType: stat.bloodType,
        count: stat._count,
      })),
    };
  }
}
