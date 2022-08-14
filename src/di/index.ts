import { container } from "tsyringe"
import dbcontext from "../lib/dbcontext"
import jwtAuthenticator from "../lib/JwtAuthenticator"
import queryStringStorer from "../lib/QueryStringStorer"
import permissionFilter from "../lib/PermissionFilter"
import {
  HomeController,
  UserController,
  AuthController,
  SurveyController,
  CommiteeController,
  AprController, UtilityController,
  AnalysisController, FileController,
  RoleController, AppController
} from '../controllers'
import { IController } from "../controllers/BaseController"

container.register('dbcontext', { useValue: dbcontext })
container.register('jwtAuthenticator', { useValue: jwtAuthenticator })
container.register('queryStringStorer', { useValue: queryStringStorer })
container.register('permissionFilter', { useValue: permissionFilter })

const homeController = container.resolve(HomeController)
const userController = container.resolve(UserController)
const authController = container.resolve(AuthController)
const surveyController = container.resolve(SurveyController)
const commiteeController = container.resolve(CommiteeController)
const aprController = container.resolve(AprController)
const utilityController = container.resolve(UtilityController)
const analysisController = container.resolve(AnalysisController)
const fileController = container.resolve(FileController)
const roleController = container.resolve(RoleController)
const appController = container.resolve(AppController)

const attachedControllers: IController[] = [
  homeController,
  userController,
  authController,
  surveyController,
  commiteeController,
  aprController,
  utilityController,
  analysisController,
  fileController,
  roleController,
  appController
]

export default attachedControllers
