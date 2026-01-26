import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsObject,
  IsArray,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
}

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'الاسم الأول',
    example: 'أحمد',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'اسم العائلة',
    example: 'محمد',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'البريد الإلكتروني',
    example: 'ahmed.mohamed@company.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'رقم الهاتف',
    example: '+966501234567',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'رقم الهوية الوطنية',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({
    description: 'المنصب',
    example: 'مدير مبيعات',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    description: 'القسم',
    example: 'المبيعات',
  })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({
    description: 'نوع التوظيف',
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
  })
  @IsNotEmpty()
  @IsEnum(EmploymentType)
  employmentType: string;

  @ApiProperty({
    description: 'الراتب الأساسي',
    example: 5000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({
    description: 'تاريخ التعيين',
    example: '2025-01-15',
    type: String,
  })
  @IsNotEmpty()
  @IsDateString()
  @Type(() => Date)
  hireDate: Date;

  @ApiPropertyOptional({
    description: 'تاريخ إنهاء الخدمة',
    example: '2025-12-31',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  terminationDate?: Date;

  @ApiPropertyOptional({
    description: 'العنوان',
  })
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    country?: string;
  };

  @ApiPropertyOptional({
    description: 'جهة الاتصال للطوارئ',
    example: 'فاطمة محمد',
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({
    description: 'رقم هاتف الطوارئ',
    example: '+966507654321',
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({
    description: 'المدير المباشر',
    example: '60f1b2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsMongoId()
  manager?: string;

  @ApiPropertyOptional({
    description: 'المهارات',
    example: ['JavaScript', 'Node.js', 'React'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'تفاصيل البنك',
  })
  @IsOptional()
  @IsObject()
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban?: string;
  };

  @ApiPropertyOptional({
    description: 'أيام الإجازة السنوية',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLeaveDays?: number;

  @ApiPropertyOptional({
    description: 'أيام الإجازة المرضية',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sickLeaveDays?: number;
}
