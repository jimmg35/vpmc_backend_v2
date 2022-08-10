import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'

const { OK } = StatusCodes

interface IStaticFile {
  serverPath: string
  alias: string
}

@autoInjectable()
export default class FileController extends BaseController {

  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "getBulletinFileInfo": "GET",
    "getGeneralLawFileInfo": "GET",
    "getReportSampleFileInfo": "GET"
  }

  constructor() {
    super()
  }

  public getBulletinFileInfo = async (req: Request, res: Response) => {
    const serverRoute = process.env.Static_File_Prod + 'static/bulletin/'
    const files: IStaticFile[] = [
      { serverPath: serverRoute + 'a.pdf', alias: '2016.11.02第一號公報-不動產估價師職業道德規範' },
      { serverPath: serverRoute + 'b.pdf', alias: '2016.11.02第二號公報-敘述式不動產估價報告書範本' },
      { serverPath: serverRoute + 'c.pdf', alias: '2018.11.14第四號公報-營造或施工費標準表' },
      { serverPath: serverRoute + 'd.pdf', alias: '2016.11.02第五號公報-收益法之直接資本化法' },
      { serverPath: serverRoute + 'e.pdf', alias: '2016.11.02第六號公報-臺北市都市更新權利變換不動產估價報告書範本及審查注意事項' },
      { serverPath: serverRoute + 'f.pdf', alias: '2020.02.03第七號公報-房地成本價格評估及房地價格推估素地價格準則' },
      { serverPath: serverRoute + 'g.pdf', alias: '2020.02.15第八號公報-公開發行公司取得或處分資產處理準則' },
      { serverPath: serverRoute + 'h.pdf', alias: '2021.08.31第九號公報-瑕疵不動產污名價值減損估價指引' },
      { serverPath: serverRoute + 'i.pdf', alias: '2022.01.18第十號公報-土地徵收前協議價購估價指引' }
    ]
    return res.status(OK).json(files)
  }

  public getGeneralLawFileInfo = async (req: Request, res: Response) => {
    const serverRoute = process.env.Static_File_Prod + 'static/generalLaw/'
    const files: IStaticFile[] = [
      { serverPath: serverRoute + 'a.pdf', alias: '2017.12.08第一號估價作業通則：公共設施用地及公共設施保留地(暨既成巷道)' },
      { serverPath: serverRoute + 'b.pdf', alias: '2017.12.20第二號估價作業通則：臺北市都市危險及老舊建物重建' },
      { serverPath: serverRoute + 'c.pdf', alias: '2019.03.21第三號估價作業通則：停車位估價課題與建議' },
      { serverPath: serverRoute + 'd.pdf', alias: '2019.06.19第四號估價作業通則：價格日期調整建議' },
      { serverPath: serverRoute + 'e.pdf', alias: '2019.11.01第五號估價作業通則：建物經濟耐用年數調整及加計' },
      { serverPath: serverRoute + 'f.pdf', alias: '2019.11.27第六號估價作業通則：共有不動產(持分產權不動產)估價通則' },
      { serverPath: serverRoute + 'g.pdf', alias: '2020.08.12第七號估價作業通則：收益資本化率及折現率之決定' },
      { serverPath: serverRoute + 'h.pdf', alias: '2021.01.15第八號估價作業通則：估價條件擬定' },
      { serverPath: serverRoute + 'i.pdf', alias: '2021.01.20第九號估價作業通則：採取單一種估價方法之適用情況' },
      { serverPath: serverRoute + 'j.pdf', alias: '2021.02.01第十號估價作業通則：停車位面積拆算' }
    ]
    return res.status(OK).json(files)
  }

  public getReportSampleFileInfo = async (req: Request, res: Response) => {
    const serverRoute = process.env.Static_File_Prod + 'static/reportSample/'
    const files: IStaticFile[] = [
      { serverPath: serverRoute + 'a.doc', alias: '台北市107.0104' },
      { serverPath: serverRoute + 'b.docx', alias: '新北市110.0416' },
      { serverPath: serverRoute + 'c.doc', alias: '桃園市108.1023' },
      { serverPath: serverRoute + 'e.docx', alias: '台中市110.0121' },
    ]
    return res.status(OK).json(files)
  }

}
