import { Server } from './server'
import attachedControllers from './di'

(async () => {

  // 註冊控制器
  const server = new Server({
    controllers: attachedControllers
  })

  // 啟動後端伺服器
  server.start()

})()
