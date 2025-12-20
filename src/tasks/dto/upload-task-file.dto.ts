import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class UploadTaskFileDto {
  @ApiProperty({
    description: 'File name',
    example: 'task-document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  fileName: string

  @ApiProperty({
    description: 'File path in storage',
    example: '/uploads/tasks/uuid/task-document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  filePath: string

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024
  })
  @IsInt()
  @Min(1)
  fileSize: number
}
