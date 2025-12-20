import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as argon2 from 'argon2'

import { PasswordHistoryRepository } from '../repositories'

@Injectable()
export class PasswordHistoryService {
  private readonly historyLimit: number

  constructor(
    private readonly passwordHistoryRepository: PasswordHistoryRepository,
    private readonly configService: ConfigService
  ) {
    this.historyLimit = this.configService.get<number>(
      'PASSWORD_HISTORY_LIMIT',
      5
    )
  }

  async addToHistory(userId: string, passwordHash: string): Promise<void> {
    await this.passwordHistoryRepository.create(userId, passwordHash)
    await this.passwordHistoryRepository.deleteOldEntries(
      userId,
      this.historyLimit
    )
  }

  async isPasswordReused(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    if (this.historyLimit === 0) {
      return false
    }

    const history = await this.passwordHistoryRepository.findLastN(
      userId,
      this.historyLimit
    )

    for (const entry of history) {
      const isMatch = await argon2.verify(entry.passwordHash, newPassword)
      if (isMatch) {
        return true
      }
    }

    return false
  }
}
