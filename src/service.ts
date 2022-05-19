import { Server } from './server'
import {
  HomeController,
  UserController,
  AuthController,
  SurveyController,
  CommiteeController
} from './controllers'
import { container } from 'tsyringe'
import sha256 from "fast-sha256"
import util from "tweetnacl-util"

(async () => {
  // console.log(util.encodeBase64(sha256('Jim60308#' as any)))

  // 註冊controllers
  const homeController = container.resolve(HomeController)
  const userController = container.resolve(UserController)
  const authController = container.resolve(AuthController)
  const surveyController = container.resolve(SurveyController)
  const commiteeController = container.resolve(CommiteeController)

  const server = new Server({
    controllers: [
      homeController,
      userController,
      authController,
      surveyController,
      commiteeController
    ]
  })

  // 啟動後端伺服器
  server.start()

  // open(`http://localhost:${process.env.PORT}/api/docs`)
})()
