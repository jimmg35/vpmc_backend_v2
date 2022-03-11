import { Server } from "./server"
import {
    HomeController,
    UserController,
    AuthController,
    SurveyController
} from './controllers'
import { Seeder } from "./seeding"
import { container } from "tsyringe"



(async () => {

    // 輸入資料
    const seeder = container.resolve(Seeder)
    await seeder.dbcontext.connect()
    await seeder.seedRole()
    await seeder.dbcontext.connection.close()

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

})();
