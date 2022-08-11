import jwt from 'jsonwebtoken'
import { truncate } from 'fs'
import { Repository } from 'typeorm'
import { Role } from '../entity/authentication/Role'
import { App } from '../entity/authentication/App'

export interface tokenPayload {
  _userId: string
  username: string
  email: string
  alias: string
  roles: Role[]
}

export default class JwtAuthenticator {

  public expireTime: number

  constructor() {
    this.expireTime = 3600
  }

  /**
   * 負責簽發jwt token
   */
  public signToken = (payload: tokenPayload): string => {
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: this.expireTime }
    )
    return token
  }

  /**
   * 計算Token剩餘時間
   * @param token 
   * @returns 
   */
  public computeLeftTime = (token: string) => {
    const payload: any = jwt.decode(token)!
    const expirationTime = payload.exp
    const currentTime = Math.floor(Date.now() / 1000)
    const timeDelta = expirationTime - currentTime
    return timeDelta
  }

  /**
   * 檢查Token是否過期
   * @param token 
   * @returns 
   */
  public isTokenExpired = (token: string): boolean => {
    const timeDelta = this.computeLeftTime(token)
    if (timeDelta > 0) {
      return false
    }
    return true
  }

  /**
   * 檢查Token是否有效
   * @param token 
   * @returns 
   */
  public isTokenValid = (token: string | undefined): any => {
    if (!token) return false
    try {
      const status = true
      const payload: any = jwt.verify(token, process.env.JWT_SECRET as string)
      // console.log(payload)
      return { status, payload }
    } catch {
      return false
    }
  }

  /**
   * 從payload解析出role code陣列，並判斷是否符合條件
   * @param payload 
   * @returns 
   */
  public filterRole = (payload: any): string[] => {
    const roleCodeArray: string[] = payload.roles.map((r: any) => r.code)
    return roleCodeArray
  }

  public isRoleQualify = (roleCodeArray: string[], roleCodes: string[]): boolean => {
    for (let i = 0; i < roleCodeArray.length; i++) {
      if (roleCodes.includes(roleCodeArray[i])) return true
    }
    return false
  }

  /**
   * 解析payload內容
   * @param token 
   */
  public decodePayload = (token: string) => {
    let aa = jwt.decode(token)
    console.log(aa)
  }

}



/** 
 * 
 * 判斷token是否有效並且符合要求的權限
 * 
 * const permission = isTokenPermitted({
 *   token: req.headers.authorization,
 *   jwtAuthenticator: this.jwtAuthenticator,
 *   permitRole: ['admin:ccis', 'user:ccis']
 * })
 * 
 * @param param0 
 * @returns 
 */
export interface IisTokenPermitted {
  token: string | undefined
  jwtAuthenticator: JwtAuthenticator
  permitRole: string[]
}
export const isTokenPermitted = ({
  token,
  jwtAuthenticator,
  permitRole,
}: IisTokenPermitted) => {
  const { status, payload } = jwtAuthenticator.isTokenValid(token)
  if (!status) return false
  const userRoles = jwtAuthenticator.filterRole(payload)
  const permission = jwtAuthenticator.isRoleQualify(userRoles, permitRole)
  return permission
}


/**
 * 動態判斷給定的roleCode陣列是否擁有該app
 */
export interface IisRoleHasApp {
  token: string | undefined
  jwtAuthenticator: JwtAuthenticator
  appCode: string
  role_repository: Repository<Role>
  app_repository: Repository<App>
}
export const isRoleHasApp = async ({
  token,
  jwtAuthenticator,
  appCode,
  role_repository,
  app_repository
}: IisRoleHasApp) => {
  const { status, payload } = jwtAuthenticator.isTokenValid(token)
  if (!status) return false
  const roleCodes = jwtAuthenticator.filterRole(payload)
  const codeWrappedInQuotes = roleCodes.map((code: string) => `'${code}'`)
  const withCommasInBetween = codeWrappedInQuotes.join(',')
  const roleApps = await role_repository.createQueryBuilder("role")
    .where(`role.code in (${withCommasInBetween})`)
    .leftJoinAndSelect("role.apps", "app").getMany()

  console.log('===========================')
  console.log(roleCodes)
  console.log(roleApps)
}

// (() => {
//     const ja = new JwtAuthenticator()

//     let token = ja.signToken({
//         _userId: "123",
//         username: "jimmg35"
//     })

//     console.log(token)
//     const aa = ja.isTokenExpired("eyJhbGciOaaaiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdXNlcklkIjoiMTIzIiwidXNlcm5hbWUiOiJqaW1tZzM1IiwiaWF0IjoxNjQxODMxNzMxLCJleHAiOjE2NDE4MzE3MzZ9.ck8CsZ_eaaaa7AtlBwP3GnlqaoMD0sxJ70XESl922gQV2w8")
//     console.log(aa)
//     // setTimeout(() => {
//     //     const tokenStatus = ja.isTokenValid(token)
//     //     console.log(tokenStatus)
//     // }, 10000)
// })()