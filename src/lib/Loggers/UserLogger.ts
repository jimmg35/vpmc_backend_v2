import { autoInjectable, container } from 'tsyringe'
import { User } from '../../entity/authentication/User'
import { PostgreSQLContext } from '../dbcontext'
import { UserLoginLogs } from '../../entity/authentication/UserLoginLogs'

export type LoginEntry = 'default' | 'google'

interface ILogLogin {
  email: string
  entry: LoginEntry
  isSuccessed: boolean
  user: User
}

@autoInjectable()
export class UserLogger {

  public dbcontext: PostgreSQLContext

  constructor(dbcontext: PostgreSQLContext) {
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  public logLogin = async ({
    email, entry, isSuccessed, user
  }: ILogLogin) => {

    const loginLogs_repo = this.dbcontext.connection.getRepository(UserLoginLogs)
    const log = new UserLoginLogs()
    log.email = email
    log.entry = entry
    log.isSuccessed = isSuccessed


  }

}

const userLogger = container.resolve(UserLogger)
export default userLogger
