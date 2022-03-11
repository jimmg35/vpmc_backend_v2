import { BaseController, HTTPMETHOD } from "./BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { Protected, extractPostParams } from "./util"
import JwtAuthenticator from "../lib/JwtAuthenticator"

const { OK, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class SurveyController extends BaseController {

    public dbcontext: PostgreSQLContext
    public jwtAuthenticator: JwtAuthenticator
    public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
        "new": "POST",
    }

    constructor(dbcontext: PostgreSQLContext, jwtAuthenticator: JwtAuthenticator) {
        super()
        this.dbcontext = dbcontext
        this.dbcontext.connect()
        this.jwtAuthenticator = jwtAuthenticator
    }

    public get = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token)
        if (status) {
            return res.status(OK).json({
                "status": "success"
            })
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

}
