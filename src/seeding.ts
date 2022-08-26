import './pre-start'
import { autoInjectable } from "tsyringe"
import { PostgreSQLContext } from "./lib/dbcontext"
import { Role } from "./entity/authentication/Role"
import { container } from "tsyringe"
import { App } from "./entity/authentication/App"
import path from 'path'
import dotenv from 'dotenv'
import commandLineArgs from 'command-line-args'

@autoInjectable()
export class Seeder {

  public dbcontext: PostgreSQLContext

  constructor(dbcontext: PostgreSQLContext) {
    this.dbcontext = dbcontext
  }

  public seedRole = async () => {

    const role_repository = this.dbcontext.connection.getRepository(Role)
    await role_repository.insert([
      { name: '一般使用者', code: 'user:basic' },
      { name: 'ccis使用者', code: 'user:ccis' },
      { name: 'ccis管理員', code: 'admin:ccis' },
      { name: 'root管理員', code: 'admin:root' }
    ])

    const app_repository = this.dbcontext.connection.getRepository(App)
    await app_repository.insert([
      { name: '技術公報/範本', code: 'info:bulletin' },
      { name: '估價相關法令', code: 'info:generalLaw' },
      { name: '臺灣總經概覽', code: 'info:twTrend' },
      { name: '使照建照統計', code: 'info:licenseSta' },
      { name: '後台管理系統', code: 'info:admin' },
      { name: '新聞跑馬燈', code: 'news:marquee' },
      { name: '實價地圖', code: 'function:aprMap' },
      { name: '估價分析/現勘資料表', code: 'function:surveySheet' },
      { name: '估價分析/市場比較法', code: 'function:marketCompare' },
      { name: '估價分析/批次市場比較法', code: 'function:batchMarketCompare' },
      { name: '估價分析/土開分析法', code: 'function:landDevelop' },
    ])
  }

}

(async () => {
  // 輸入資料
  // const seeder = container.resolve(Seeder)
  // await seeder.dbcontext.connect()
  // await seeder.seedRole()
  // await seeder.dbcontext.connection.close()
})()
