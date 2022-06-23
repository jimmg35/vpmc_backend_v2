import { BaseController, HTTPMETHOD } from "./BaseController"
import { User } from "../entity/authentication/User"
import { Role } from "../entity/authentication/Role"
import { PostgreSQLContext } from "../dbcontext"
import { Request, Response } from 'express'
import { autoInjectable } from "tsyringe"
import sha256 from "fast-sha256"
import StatusCodes from 'http-status-codes'
import util from "tweetnacl-util"
import JwtAuthenticator from "../lib/JwtAuthenticator"

const { OK, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class AuthController extends BaseController {


  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "authenticate": "POST",
    "refresh": "POST",
    "validate": "POST"
  }

  constructor(dbcontext: PostgreSQLContext, jwtAuthenticator: JwtAuthenticator) {
    super()
    this.dbcontext = dbcontext
    this.dbcontext.connect()
    this.jwtAuthenticator = jwtAuthenticator
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
    const userRoles = await user_repository.createQueryBuilder("user")
      .where("user.userId = :userId", { userId: user?.userId })
      .leftJoinAndSelect("user.roles", "role").getOne()

    if (user == undefined) {
      return res.status(UNAUTHORIZED).json({
        "status": "此帳號尚未註冊"
      })
    }

    if (user?.isActive == false) {
      return res.status(UNAUTHORIZED).json({
        "status": "此帳號尚未認證，請去Email收信"
      })
    }

    if (user?.password == util.encodeBase64(sha256(params_set.password)) && user.isActive == true && userRoles) {
      const token = this.jwtAuthenticator.signToken({
        _userId: user.userId,
        username: user.username,
        email: user.email,
        alias: user.alias,
        roles: userRoles.roles
      })
      return res.status(OK).json({
        "token": token
      })
    }

    return res.status(UNAUTHORIZED).json({
      "status": "帳號或密碼錯誤"
    })
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
    // console.log(payload)
    if (status) {
      return res.status(OK).json(payload)
    }
    return res.status(UNAUTHORIZED).json({
      "status": "token is not valid"
    })
  }
}
