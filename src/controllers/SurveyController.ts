import { BaseController, HTTPMETHOD } from "./BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { Protected, extractPostParams, extractGetParams } from "./util"
import JwtAuthenticator from "../lib/JwtAuthenticator"
import { User } from "../entity/authentication/User"
import { LandSheet } from "../entity/SurveyDataSheet/LandSheet"
import { ParkSheet } from "../entity/SurveyDataSheet/ParkSheet"
import { BuildingSheet } from "../entity/SurveyDataSheet/BuildingSheet"
const { OK, UNAUTHORIZED, NOT_FOUND, BAD_REQUEST } = StatusCodes

@autoInjectable()
export default class SurveyController extends BaseController {

    public dbcontext: PostgreSQLContext
    public jwtAuthenticator: JwtAuthenticator
    public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
        "deleteLandSheet": "DELETE",
        "deleteParkSheet": "DELETE",
        "deleteBuildingSheet": "DELETE",
        "editLandSheet": "PUT",
        "editParkSheet": "PUT",
        "editBuildingSheet": "PUT",
        "listDataSheets": "GET",
        "createLandSheet": "POST",
        "createParkSheet": "POST",
        "createBuildingSheet": "POST"
    }

    constructor(dbcontext: PostgreSQLContext, jwtAuthenticator: JwtAuthenticator) {
        super()
        this.dbcontext = dbcontext
        this.dbcontext.connect()
        this.jwtAuthenticator = jwtAuthenticator
    }

    public deleteLandSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const landSheet_repository = this.dbcontext.connection.getRepository(LandSheet)
            const landSheet = await landSheet_repository.createQueryBuilder("landsheet")
                .where("landsheet.sheetId = :sheetId", { sheetId: params_set._sheetId }).getOne()
            if (landSheet) {
                await landSheet_repository.remove(landSheet)
                return res.status(OK).json({
                    "status": "刪除成功"
                })
            } else {
                return res.status(BAD_REQUEST).json({
                    "status": "找不到此紀錄"
                })
            }

        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public deleteParkSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const parkSheet_repository = this.dbcontext.connection.getRepository(ParkSheet)
            const parkSheet = await parkSheet_repository.createQueryBuilder("parksheet")
                .where("parksheet.sheetId = :sheetId", { sheetId: params_set._sheetId }).getOne()
            if (parkSheet) {
                await parkSheet_repository.remove(parkSheet)
                return res.status(OK).json({
                    "status": "刪除成功"
                })
            } else {
                return res.status(BAD_REQUEST).json({
                    "status": "找不到此紀錄"
                })
            }
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public deleteBuildingSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const buildingSheet_repository = this.dbcontext.connection.getRepository(BuildingSheet)
            const buildingSheet = await buildingSheet_repository.createQueryBuilder("buildingsheet")
                .where("buildingsheet.sheetId = :sheetId", { sheetId: params_set._sheetId }).getOne()
            if (buildingSheet) {
                await buildingSheet_repository.remove(buildingSheet)
                return res.status(OK).json({
                    "status": "刪除成功"
                })
            } else {
                return res.status(BAD_REQUEST).json({
                    "status": "找不到此紀錄"
                })
            }
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public editLandSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const landSheet_repository = this.dbcontext.connection.getRepository(LandSheet)
            const landSheet = await landSheet_repository.createQueryBuilder("landsheet")
                .where("landsheet.sheetId = :sheetId", { sheetId: params_set._sheetId }).getOne()
            if (landSheet) {
                landSheet.assetType = params_set.assetType
                landSheet.landMarkCounty = params_set.landMarkCounty
                landSheet.landMarkVillage = params_set.landMarkVillage
                landSheet.landMarkName = params_set.landMarkName
                landSheet.landMarkCode = params_set.landMarkCode
                landSheet.buildMarkCounty = params_set.buildMarkCounty
                landSheet.buildMarkVillage = params_set.buildMarkVillage
                landSheet.buildMarkName = params_set.buildMarkName
                landSheet.buildMarkCode = params_set.buildMarkCode
                landSheet.buildAddressCounty = params_set.buildAddressCounty
                landSheet.buildAddressVillage = params_set.buildAddressVillage
                landSheet.buildAddress = params_set.buildAddress
                landSheet.landArea = params_set.landArea
                landSheet.landRightsOwner = params_set.landRightsOwner
                landSheet.landRightsStatus = params_set.landRightsStatus
                landSheet.landRightsHolding = params_set.landRightsHolding
                landSheet.otherRights = params_set.otherRights
                landSheet.landUses = params_set.landUses
                landSheet.BuildingCoverageRatio = params_set.BuildingCoverageRatio
                landSheet.floorAreaRatio = params_set.floorAreaRatio
                landSheet.inspectionDate = params_set.inspectionDate
                landSheet.valueOpinionDate = params_set.valueOpinionDate
                landSheet.appraisalObject = params_set.appraisalObject
                landSheet.appraisalDescription = params_set.appraisalDescription
                landSheet.priceType = params_set.priceType
                landSheet.evaluationRightsType = params_set.evaluationRightsType
                landSheet.appraisalCondition = params_set.appraisalCondition
                landSheet.surveyorName = params_set.surveyorName
                landSheet.surveyDescription = params_set.surveyDescription
                landSheet.transcriptFileBase64 = params_set.transcriptFileBase64
                landSheet.transcriptFileName = params_set.transcriptFileName
                landSheet.photoFilesBase64 = JSON.parse(params_set.photoFilesBase64)
                landSheet.photoFilesName = params_set.photoFilesName.split(',')
                await landSheet_repository.save(landSheet)
                return res.status(OK).json({
                    "status": "更新成功"
                })
            } else {
                return res.status(NOT_FOUND).json({
                    "status": "找不到此資料表"
                })
            }
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public editParkSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const parkSheet_repository = this.dbcontext.connection.getRepository(ParkSheet)
            const parkSheet = await parkSheet_repository.createQueryBuilder("parksheet")
                .where("parksheet.sheetId = :sheetId", { sheetId: params_set._sheetId }).getOne()
            if (parkSheet) {
                parkSheet.assetType = params_set.assetType
                parkSheet.landMarkCounty = params_set.landMarkCounty
                parkSheet.landMarkVillage = params_set.landMarkVillage
                parkSheet.landMarkName = params_set.landMarkName
                parkSheet.landMarkCode = params_set.landMarkCode
                parkSheet.buildMarkCounty = params_set.buildMarkCounty
                parkSheet.buildMarkVillage = params_set.buildMarkVillage
                parkSheet.buildMarkName = params_set.buildMarkName
                parkSheet.buildMarkCode = params_set.buildMarkCode
                parkSheet.buildAddressCounty = params_set.buildAddressCounty
                parkSheet.buildAddressVillage = params_set.buildAddressVillage
                parkSheet.buildAddress = params_set.buildAddress
                parkSheet.ParkArea = params_set.ParkArea
                parkSheet.parkType = params_set.parkType
                parkSheet.parkMethod = params_set.parkMethod
                parkSheet.landRightsOwner = params_set.landRightsOwner
                parkSheet.landRightsStatus = params_set.landRightsStatus
                parkSheet.landRightsHolding = params_set.landRightsHolding
                parkSheet.buildingRightsOwner = params_set.buildingRightsOwner
                parkSheet.buildingRightsStatus = params_set.buildingRightsStatus
                parkSheet.buildingRightsHolding = params_set.buildingRightsHolding
                parkSheet.otherRights = params_set.otherRights
                parkSheet.assignMethod = params_set.assignMethod
                parkSheet.landUses = params_set.landUses
                parkSheet.buildingCoverageRatio = params_set.BuildingCoverageRatio
                parkSheet.floorAreaRatio = params_set.floorAreaRatio
                parkSheet.buildingUsage = params_set.buildingUsage
                parkSheet.buildingStructure = params_set.buildingStructure
                parkSheet.buildingFinishDate = params_set.buildingFinishDate
                parkSheet.buildingUpFloor = params_set.buildingUpFloor
                parkSheet.buildingDownFloor = params_set.buildingDownFloor
                parkSheet.surveyFloor = params_set.surveyFloor
                parkSheet.parkWidth = params_set.parkWidth
                parkSheet.parkHeight = params_set.parkHeight
                parkSheet.allowSuv = params_set.allowSuv
                parkSheet.inspectionDate = params_set.inspectionDate
                parkSheet.valueOpinionDate = params_set.valueOpinionDate
                parkSheet.appraisalObject = params_set.appraisalObject
                parkSheet.appraisalDescription = params_set.appraisalDescription
                parkSheet.priceType = params_set.priceType
                parkSheet.evaluationRightsType = params_set.evaluationRightsType
                parkSheet.appraisalCondition = params_set.appraisalCondition
                parkSheet.surveyorName = params_set.surveyorName
                parkSheet.surveyDescription = params_set.surveyDescription
                parkSheet.transcriptFileBase64 = params_set.transcriptFileBase64
                parkSheet.transcriptFileName = params_set.transcriptFileName
                parkSheet.photoFilesBase64 = JSON.parse(params_set.photoFilesBase64)
                parkSheet.photoFilesName = params_set.photoFilesName.split(',')
                await parkSheet_repository.save(parkSheet)
                return res.status(OK).json({
                    "status": "更新成功"
                })
            } else {
                return res.status(NOT_FOUND).json({
                    "status": "找不到此資料表"
                })
            }
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public editBuildingSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const buildingSheet_repository = this.dbcontext.connection.getRepository(BuildingSheet)
            const buildingSheet = await buildingSheet_repository.createQueryBuilder("buildingsheet")
                .where("buildingsheet.sheetId = :sheetId", { sheetId: params_set._sheetId }).getOne()
            if (buildingSheet) {
                buildingSheet.assetType = params_set.assetType
                buildingSheet.landMarkCounty = params_set.landMarkCounty
                buildingSheet.landMarkVillage = params_set.landMarkVillage
                buildingSheet.landMarkName = params_set.landMarkName
                buildingSheet.landMarkCode = params_set.landMarkCode
                buildingSheet.buildMarkCounty = params_set.buildMarkCounty
                buildingSheet.buildMarkVillage = params_set.buildMarkVillage
                buildingSheet.buildMarkName = params_set.buildMarkName
                buildingSheet.buildMarkCode = params_set.buildMarkCode
                buildingSheet.buildAddressCounty = params_set.buildAddressCounty
                buildingSheet.buildAddressVillage = params_set.buildAddressVillage
                buildingSheet.buildAddress = params_set.buildAddress
                buildingSheet.landArea = params_set.landArea
                buildingSheet.buildingArea = params_set.buildingArea
                buildingSheet.landRightsOwner = params_set.landRightsOwner
                buildingSheet.landRightsStatus = params_set.landRightsStatus
                buildingSheet.landRightsHolding = params_set.landRightsHolding
                buildingSheet.buildingRightsOwner = params_set.buildingRightsOwner
                buildingSheet.buildingRightsStatus = params_set.buildingRightsStatus
                buildingSheet.buildingRightsHolding = params_set.buildingRightsHolding
                buildingSheet.otherRights = params_set.otherRights
                buildingSheet.landUses = params_set.landUses
                buildingSheet.BuildingCoverageRatio = params_set.BuildingCoverageRatio
                buildingSheet.floorAreaRatio = params_set.floorAreaRatio
                buildingSheet.buildingUsage = params_set.buildingUsage
                buildingSheet.buildingStructure = params_set.buildingStructure
                buildingSheet.buildingFinishDate = params_set.buildingFinishDate
                buildingSheet.buildingUpFloor = params_set.buildingUpFloor
                buildingSheet.buildingDownFloor = params_set.buildingDownFloor
                buildingSheet.surveyFloor = params_set.surveyFloor
                buildingSheet.inspectionDate = params_set.inspectionDate
                buildingSheet.valueOpinionDate = params_set.valueOpinionDate
                buildingSheet.appraisalObject = params_set.appraisalObject
                buildingSheet.appraisalDescription = params_set.appraisalDescription
                buildingSheet.priceType = params_set.priceType
                buildingSheet.evaluationRightsType = params_set.evaluationRightsType
                buildingSheet.appraisalCondition = params_set.appraisalCondition
                buildingSheet.surveyorName = params_set.surveyorName
                buildingSheet.surveyDescription = params_set.surveyDescription
                buildingSheet.transcriptFileBase64 = params_set.transcriptFileBase64
                buildingSheet.transcriptFileName = params_set.transcriptFileName
                buildingSheet.photoFilesBase64 = JSON.parse(params_set.photoFilesBase64)
                buildingSheet.photoFilesName = params_set.photoFilesName.split(',')
                await buildingSheet_repository.save(buildingSheet)
                return res.status(OK).json({
                    "status": "更新成功"
                })
            } else {
                return res.status(NOT_FOUND).json({
                    "status": "找不到此資料表"
                })
            }
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public listDataSheets = async (req: Request, res: Response) => {
        const params_set = extractGetParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token as string)
        if (status) {
            const user_repository = this.dbcontext.connection.getRepository(User)
            const user = await user_repository.createQueryBuilder("user")
                .where("user.userId = :userId", { userId: payload._userId })
                .leftJoinAndSelect("user.landSheets", "landsheet")
                .leftJoinAndSelect("user.parkSheets", "parksheet")
                .leftJoinAndSelect("user.buildingSheets", "buildingsheet").getOne()
            const output = {
                'land': user?.landSheets,
                'park': user?.parkSheets,
                'building': user?.buildingSheets
            }
            return res.status(OK).json({
                ...output
            })
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public createLandSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token)
        if (status) {
            const user_repository = this.dbcontext.connection.getRepository(User)
            const landSheet_repository = this.dbcontext.connection.getRepository(LandSheet)
            const user = await user_repository.findOne({ userId: payload._userId })
            const landSheet = new LandSheet()
            landSheet.user = user as User
            landSheet.assetType = params_set.assetType
            landSheet.landMarkCounty = params_set.landMarkCounty
            landSheet.landMarkVillage = params_set.landMarkVillage
            landSheet.landMarkName = params_set.landMarkName
            landSheet.landMarkCode = params_set.landMarkCode
            landSheet.buildMarkCounty = params_set.buildMarkCounty
            landSheet.buildMarkVillage = params_set.buildMarkVillage
            landSheet.buildMarkName = params_set.buildMarkName
            landSheet.buildMarkCode = params_set.buildMarkCode
            landSheet.buildAddressCounty = params_set.buildAddressCounty
            landSheet.buildAddressVillage = params_set.buildAddressVillage
            landSheet.buildAddress = params_set.buildAddress
            landSheet.landArea = params_set.landArea
            landSheet.landRightsOwner = params_set.landRightsOwner
            landSheet.landRightsStatus = params_set.landRightsStatus
            landSheet.landRightsHolding = params_set.landRightsHolding
            landSheet.otherRights = params_set.otherRights
            landSheet.landUses = params_set.landUses
            landSheet.BuildingCoverageRatio = params_set.BuildingCoverageRatio
            landSheet.floorAreaRatio = params_set.floorAreaRatio
            landSheet.inspectionDate = params_set.inspectionDate
            landSheet.valueOpinionDate = params_set.valueOpinionDate
            landSheet.appraisalObject = params_set.appraisalObject
            landSheet.appraisalDescription = params_set.appraisalDescription
            landSheet.priceType = params_set.priceType
            landSheet.evaluationRightsType = params_set.evaluationRightsType
            landSheet.appraisalCondition = params_set.appraisalCondition
            landSheet.surveyorName = params_set.surveyorName
            landSheet.surveyDescription = params_set.surveyDescription
            landSheet.transcriptFileBase64 = params_set.transcriptFileBase64
            landSheet.transcriptFileName = params_set.transcriptFileName
            landSheet.photoFilesBase64 = JSON.parse(params_set.photoFilesBase64)
            landSheet.photoFilesName = params_set.photoFilesName.split(',')
            await landSheet_repository.save(landSheet)
            return res.status(OK).json({
                "status": "現勘表新增成功"
            })
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public createParkSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token)
        if (status) {
            const user_repository = this.dbcontext.connection.getRepository(User)
            const parkSheet_repository = this.dbcontext.connection.getRepository(ParkSheet)
            const user = await user_repository.findOne({ userId: payload._userId })
            const parkSheet = new ParkSheet()
            parkSheet.user = user as User
            parkSheet.assetType = params_set.assetType
            parkSheet.landMarkCounty = params_set.landMarkCounty
            parkSheet.landMarkVillage = params_set.landMarkVillage
            parkSheet.landMarkName = params_set.landMarkName
            parkSheet.landMarkCode = params_set.landMarkCode
            parkSheet.buildMarkCounty = params_set.buildMarkCounty
            parkSheet.buildMarkVillage = params_set.buildMarkVillage
            parkSheet.buildMarkName = params_set.buildMarkName
            parkSheet.buildMarkCode = params_set.buildMarkCode
            parkSheet.buildAddressCounty = params_set.buildAddressCounty
            parkSheet.buildAddressVillage = params_set.buildAddressVillage
            parkSheet.buildAddress = params_set.buildAddress
            parkSheet.ParkArea = params_set.ParkArea
            parkSheet.parkType = params_set.parkType
            parkSheet.parkMethod = params_set.parkMethod
            parkSheet.landRightsOwner = params_set.landRightsOwner
            parkSheet.landRightsStatus = params_set.landRightsStatus
            parkSheet.landRightsHolding = params_set.landRightsHolding
            parkSheet.buildingRightsOwner = params_set.buildingRightsOwner
            parkSheet.buildingRightsStatus = params_set.buildingRightsStatus
            parkSheet.buildingRightsHolding = params_set.buildingRightsHolding
            parkSheet.otherRights = params_set.otherRights
            parkSheet.assignMethod = params_set.assignMethod
            parkSheet.landUses = params_set.landUses
            parkSheet.buildingCoverageRatio = params_set.BuildingCoverageRatio
            parkSheet.floorAreaRatio = params_set.floorAreaRatio
            parkSheet.buildingUsage = params_set.buildingUsage
            parkSheet.buildingStructure = params_set.buildingStructure
            parkSheet.buildingFinishDate = params_set.buildingFinishDate
            parkSheet.buildingUpFloor = params_set.buildingUpFloor
            parkSheet.buildingDownFloor = params_set.buildingDownFloor
            parkSheet.surveyFloor = params_set.surveyFloor
            parkSheet.parkWidth = params_set.parkWidth
            parkSheet.parkHeight = params_set.parkHeight
            parkSheet.allowSuv = params_set.allowSuv
            parkSheet.inspectionDate = params_set.inspectionDate
            parkSheet.valueOpinionDate = params_set.valueOpinionDate
            parkSheet.appraisalObject = params_set.appraisalObject
            parkSheet.appraisalDescription = params_set.appraisalDescription
            parkSheet.priceType = params_set.priceType
            parkSheet.evaluationRightsType = params_set.evaluationRightsType
            parkSheet.appraisalCondition = params_set.appraisalCondition
            parkSheet.surveyorName = params_set.surveyorName
            parkSheet.surveyDescription = params_set.surveyDescription
            parkSheet.transcriptFileBase64 = params_set.transcriptFileBase64
            parkSheet.transcriptFileName = params_set.transcriptFileName
            parkSheet.photoFilesBase64 = JSON.parse(params_set.photoFilesBase64)
            parkSheet.photoFilesName = params_set.photoFilesName.split(',')
            await parkSheet_repository.save(parkSheet)
            return res.status(OK).json({
                "status": "現勘表新增成功"
            })
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

    public createBuildingSheet = async (req: Request, res: Response) => {
        const params_set = extractPostParams(req)
        const { status, payload } = this.jwtAuthenticator.isTokenValid(params_set.token)
        if (status) {
            const user_repository = this.dbcontext.connection.getRepository(User)
            const buildingSheet_repository = this.dbcontext.connection.getRepository(BuildingSheet)
            const user = await user_repository.findOne({ userId: payload._userId })
            const buildingSheet = new BuildingSheet()
            buildingSheet.user = user as User
            buildingSheet.assetType = params_set.assetType
            buildingSheet.landMarkCounty = params_set.landMarkCounty
            buildingSheet.landMarkVillage = params_set.landMarkVillage
            buildingSheet.landMarkName = params_set.landMarkName
            buildingSheet.landMarkCode = params_set.landMarkCode
            buildingSheet.buildMarkCounty = params_set.buildMarkCounty
            buildingSheet.buildMarkVillage = params_set.buildMarkVillage
            buildingSheet.buildMarkName = params_set.buildMarkName
            buildingSheet.buildMarkCode = params_set.buildMarkCode
            buildingSheet.buildAddressCounty = params_set.buildAddressCounty
            buildingSheet.buildAddressVillage = params_set.buildAddressVillage
            buildingSheet.buildAddress = params_set.buildAddress
            buildingSheet.landArea = params_set.landArea
            buildingSheet.buildingArea = params_set.buildingArea
            buildingSheet.landRightsOwner = params_set.landRightsOwner
            buildingSheet.landRightsStatus = params_set.landRightsStatus
            buildingSheet.landRightsHolding = params_set.landRightsHolding
            buildingSheet.buildingRightsOwner = params_set.buildingRightsOwner
            buildingSheet.buildingRightsStatus = params_set.buildingRightsStatus
            buildingSheet.buildingRightsHolding = params_set.buildingRightsHolding
            buildingSheet.otherRights = params_set.otherRights
            buildingSheet.landUses = params_set.landUses
            buildingSheet.BuildingCoverageRatio = params_set.BuildingCoverageRatio
            buildingSheet.floorAreaRatio = params_set.floorAreaRatio
            buildingSheet.buildingUsage = params_set.buildingUsage
            buildingSheet.buildingStructure = params_set.buildingStructure
            buildingSheet.buildingFinishDate = params_set.buildingFinishDate
            buildingSheet.buildingUpFloor = params_set.buildingUpFloor
            buildingSheet.buildingDownFloor = params_set.buildingDownFloor
            buildingSheet.surveyFloor = params_set.surveyFloor
            buildingSheet.inspectionDate = params_set.inspectionDate
            buildingSheet.valueOpinionDate = params_set.valueOpinionDate
            buildingSheet.appraisalObject = params_set.appraisalObject
            buildingSheet.appraisalDescription = params_set.appraisalDescription
            buildingSheet.priceType = params_set.priceType
            buildingSheet.evaluationRightsType = params_set.evaluationRightsType
            buildingSheet.appraisalCondition = params_set.appraisalCondition
            buildingSheet.surveyorName = params_set.surveyorName
            buildingSheet.surveyDescription = params_set.surveyDescription
            buildingSheet.transcriptFileBase64 = params_set.transcriptFileBase64
            buildingSheet.transcriptFileName = params_set.transcriptFileName
            buildingSheet.photoFilesBase64 = JSON.parse(params_set.photoFilesBase64)
            buildingSheet.photoFilesName = params_set.photoFilesName.split(',')
            await buildingSheet_repository.save(buildingSheet)
            return res.status(OK).json({
                "status": "現勘表新增成功"
            })
        }
        return res.status(UNAUTHORIZED).json({
            "status": "token is not valid"
        })
    }

}
