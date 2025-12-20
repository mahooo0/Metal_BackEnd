import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'

import { ContactDto } from './contact.dto'

export class ReplaceContactsDto {
  @ApiProperty({
    description: 'Array of contacts to replace existing ones',
    type: [ContactDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[]
}
