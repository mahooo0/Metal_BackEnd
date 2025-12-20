import { OmitType, PartialType } from '@nestjs/swagger'

import { CreatePlanRecordDto } from './create-plan-record.dto'

export class UpdatePlanRecordDto extends PartialType(
  OmitType(CreatePlanRecordDto, ['planNumber'] as const)
) {}
