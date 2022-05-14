import { Server } from "./server"
import {
  HomeController,
  UserController,
  AuthController,
  SurveyController
} from './controllers'
import { container } from "tsyringe"

(async () => {

  // 註冊controllers
  const homeController = container.resolve(HomeController)
  const userController = container.resolve(UserController)
  const authController = container.resolve(AuthController)
  const surveyController = container.resolve(SurveyController)
  const server = new Server({
    controllers: [
      homeController,
      userController,
      authController,
      surveyController
    ]
  })

  // 啟動後端伺服器
  server.start()

})()
