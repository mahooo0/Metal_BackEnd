import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'

import { DocumentDto } from './document.dto'

export class ReplaceDocumentsDto {
  @ApiProperty({
    description: 'Array of documents to replace existing ones',
    type: [DocumentDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[]
}
