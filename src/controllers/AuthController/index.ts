import { BaseController, HTTPMETHOD } from "../BaseController"
import { User } from "../../entity/authentication/User"
import { Role } from "../../entity/authentication/Role"
import { App } from "../../entity/authentication/App"
import { PostgreSQLContext } from "../../lib/dbcontext"
import { Request, Response } from 'express'
import { autoInjectable, inject } from "tsyringe"
import sha256 from "fast-sha256"
import StatusCodes from 'http-status-codes'
import util from "tweetnacl-util"
import https from 'https'
import { JwtAuthenticator, tokenPayload } from "../../lib/JwtAuthenticator"
import { generateVerificationToken } from "../../lib/util"
import { UserLogger } from "../../lib/Loggers/UserLogger"

const { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = StatusCodes

const validateGoogleToken = async (token: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    https.get(url, function (response) {
      if (response.statusCode === 200) {
        resolve(true)
      }
      resolve(false)
    })
  })
}

@autoInjectable()
export default class AuthController extends BaseController {


  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public userLogger: UserLogger
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "authenticate": "POST",
    "googleAuth": "POST",
    "refresh": "POST",
    "validate": "POST",
    "listRoles": "GET"
  }

  constructor(
    @inject('dbcontext') dbcontext: PostgreSQLContext,
    @inject('jwtAuthenticator') jwtAuthenticator: JwtAuthenticator,
    @inject('userLogger') userLogger: UserLogger
  ) {
    super()
    this.jwtAuthenticator = jwtAuthenticator
    this.userLogger = userLogger
    this.dbcontext = dbcontext
  }

  /**
   * @swagger
   * /Auth/authenticate:
   *   post:
   *     tags: 
   *       - Auth
   *     summary: 使用者驗證.
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     description: 於登入時使用
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *
   *               email:
   *                 required: true
   *                 default: jim60308@gmail.com
   *                 type: string
   *                 description: 電子郵件
   *             
   *               password:
   *                 required: true
   *                 default: T3iSQkjwLFooeeqWQpY9OFEuMTaaKVzGC81jpYcMRqc=
   *                 type: string
   *                 description: 密碼
   *     responses:
   *       '200':    # status code
   *         description: accessToken
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public authenticate = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const user_repository = this.dbcontext.connection.getRepository(User)
    const user = await user_repository.findOne({ email: params_set.email as string })

    if (user == undefined) {
      return res.status(UNAUTHORIZED).json({
        "status": "此帳號尚未註冊"
      })
    }
    if (user?.isActive == false) {
      await this.userLogger.logLogin({
        email: user.email,
        entry: 'default',
        isSuccessed: false,
        user: user
      })
      return res.status(UNAUTHORIZED).json({
        "status": "此帳號尚未認證，請去Email收信"
      })
    }

    if (user?.password == util.encodeBase64(sha256(params_set.password)) && user.isActive == true) {
      user.lastLoginTime = new Date()
      const savedUser = await user_repository.save(user)
      await this.userLogger.logLogin({
        email: user.email,
        entry: 'default',
        isSuccessed: true,
        user: savedUser
      })
      const token = this.jwtAuthenticator.signToken({
        _userId: user.userId,
        username: user.username,
        email: user.email,
        alias: user.alias
      })
      return res.status(OK).json({
        "token": token
      })
    }

    await this.userLogger.logLogin({
      email: user.email,
      entry: 'default',
      isSuccessed: false,
      user: user
    })

    return res.status(UNAUTHORIZED).json({
      "status": "帳號或密碼錯誤"
    })
  }

  /**
   * @swagger
   * /Auth/googleAuth:
   *   post:
   *     tags: 
   *       - Auth
   *     summary: 使用者Google Auth.
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     description: 於登入時使用
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *
   *               email:
   *                 required: true
   *                 default: jim60308@gmail.com
   *                 type: string
   *                 description: 電子郵件
   *             
   *               token:
   *                 required: true
   *                 type: string
   *                 description: google OAuth 回傳的token, 用於後端驗證
   *     responses:
   *       '200':    # status code
   *         description: accessToken
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public googleAuth = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const user_repository = this.dbcontext.connection.getRepository(User)
    const user = await user_repository.findOne({ email: params_set.email as string })

    if (!user) { // 如果使用者第一次用google auth登入系統

      const status = await validateGoogleToken(params_set.token)
      if (status) {
        // 新增User
        const user_repository = this.dbcontext.connection.getRepository(User)
        const role_repository = this.dbcontext.connection.getRepository(Role)
        const user = new User()
        user.username = params_set.email.split('@')[0]
        user.email = params_set.email
        user.password = 'google auth'
        user.roles = await role_repository.find({
          code: 'user:basic'
        })
        user.mailConfirmationToken = generateVerificationToken(128)
        // 儲存User Entity
        const savedUser = await user_repository.save(user)
        // 紀錄User Log
        await this.userLogger.logLogin({
          email: user.email,
          entry: 'google',
          isSuccessed: true,
          user: savedUser
        })
        const registeredUser = await user_repository.findOne({ email: params_set.email as string })
        if (!registeredUser) return res.status(INTERNAL_SERVER_ERROR).json({
          "status": "user hasn't registered"
        })
        const token = this.jwtAuthenticator.signToken({
          _userId: registeredUser.userId,
          username: registeredUser.username,
          email: registeredUser.email,
          alias: registeredUser.alias
        })
        return res.status(OK).json({
          "token": token
        })
      }

      return res.status(UNAUTHORIZED).json({
        "status": "google token auth failed"
      })

    } else { // 如果使用者已經用google auth登入過
      user.lastLoginTime = new Date()
      const savedUser = await user_repository.save(user)
      await this.userLogger.logLogin({
        email: user.email,
        entry: 'google',
        isSuccessed: true,
        user: savedUser
      })
      const token = this.jwtAuthenticator.signToken({
        _userId: user.userId,
        username: user.username,
        email: user.email,
        alias: user.alias
      })
      return res.status(OK).json({
        "token": token
      })
    }
  }

  public refresh = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    return res.status(OK).json({
      "status": "success"
    })
  }

  /**
   * @swagger
   * /Auth/validate:
   *   post:
   *     tags: 
   *       - Auth
   *     summary: 驗證token.
   *     description: 於驗證access token時使用
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *
   *               token:
   *                 required: true
   *                 type: string
   *                 description: jwt token
   * 
   *     responses:
   *       '200':    # status code
   *         description: accessToken
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   *       '401':    # status code
   *         description: accessToken
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public validate = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token)
    if (status && payload) {
      return res.status(OK).json(payload)
    }
    return res.status(UNAUTHORIZED).json({
      "status": "token is not valid"
    })
  }

  public listRoles = async (req: Request, res: Response) => {
    const { status, payload } = this.jwtAuthenticator.isTokenValid(req.headers.authorization)
    const payloads = payload as tokenPayload
    if (status) {
      const user_repository = this.dbcontext.connection.getRepository(User)
      const userRoles = await user_repository
        .createQueryBuilder("user")
        .where("user.userId = :userId", { userId: payloads._userId })
        .leftJoinAndSelect("user.roles", "role")
        .leftJoinAndSelect("role.apps", "app")
        .getOne()
      if (!userRoles) return res.status(UNAUTHORIZED).json({ "status": "此帳號尚未被授予任何權限" })
      return res.status(OK).json(userRoles.roles)
    }
    return res.status(UNAUTHORIZED).json({
      "status": "token is not valid"
    })
  }

}
