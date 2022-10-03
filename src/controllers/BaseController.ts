import { Response, Router, Request, NextFunction } from 'express'

export type HTTPMETHOD = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "COPY" | "OPTIONS"

export type Middleware = (req: Request, res: Response, next: NextFunction) => void

export interface IBaseControllerParam {
  routeHttpMethod: { [methodName: string]: HTTPMETHOD }
  endpointMiddleware?: { [methodName: string]: Middleware }
}

export interface IController {
  routerName: string
  routeHttpMethod: { [methodName: string]: HTTPMETHOD }
  endpointMiddleware?: { [methodName: string]: Middleware | Middleware[] }
  getRouter (): Router
  setRouterName_HiddenMethod (): void
  bindRouter_HiddenMethod (
    routeName: string,
    routeHandler: any,
    httpMethod: HTTPMETHOD,
    middleware: Middleware
  ): void
  // injectDbContexts(dbcontexts: Array<DbContext>): void
}

export class BaseController implements IController {
  protected _router: Router
  public routerName: string
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD }
  public endpointMiddleware: { [methodName: string]: Middleware | Middleware[] } | undefined

  constructor(options: IBaseControllerParam =
    {
      routeHttpMethod: {},
      endpointMiddleware: {}
    }
  ) {
    this._router = Router()
    this.setRouterName_HiddenMethod()
    this.routeHttpMethod = options.routeHttpMethod
    this.endpointMiddleware = options.endpointMiddleware
  }

  public setRouterName_HiddenMethod = (): void => {
    this.routerName = '/'
    this.routerName += this.constructor.name.replace(/Controller/g, "")
  }

  public bindRouter_HiddenMethod = (
    routeName: string,
    routeHandler: any,
    httpMethod: HTTPMETHOD,
    middleware?: Middleware
  ): void => {
    const undefinedMiddleware: Middleware = (req: Request, res: Response, next: NextFunction) => {
      next()
    }
    switch (httpMethod) {
      case "GET":
        this._router.get('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
      case "POST":
        this._router.post('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
      case "PUT":
        this._router.put('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
      case "PATCH":
        this._router.patch('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
      case "DELETE":
        this._router.delete('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
      case "COPY":
        this._router.copy('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
      case "OPTIONS":
        this._router.options('/' + routeName, middleware ? middleware : undefinedMiddleware, routeHandler)
        break;
    }
  }

  public getRouter (): Router {
    return this._router
  }

  // public injectDbContexts = (dbcontexts: Array<DbContext>) => {
  //     const member_list: Array<string> = Object.getOwnPropertyNames(this)
  //     console.log(Object.fromEntries(this))
  //     const context_list = member_list.filter(member => member.includes("context"))
  // }
}

export const autoInjectSubRoutes = (controller: IController) => {
  const listMethods = (controller: IController): Array<string> => {
    const output: Array<string> = []
    for (var member in controller) {
      //@ts-ignore
      if (typeof controller[member] == "function") {
        if (controller.hasOwnProperty(member)) {
          output.push(member)
        }
      }
    }
    return output
  }
  const excludeBaseMethods = (methods: Array<string>): Array<string> => {
    const output: Array<string> = []
    methods.forEach((method) => {
      if (!(method.includes("_HiddenMethod") || method === "_router")) {
        output.push(method)
      }
    })
    return output
  }
  excludeBaseMethods(listMethods(controller)).forEach((method) => {

    if (controller.endpointMiddleware) {
      //@ts-ignore
      controller.bindRouter_HiddenMethod(method, controller[method], controller.routeHttpMethod[method], controller.endpointMiddleware[method])
    } else {
      //@ts-ignore
      controller.bindRouter_HiddenMethod(method, controller[method], controller.routeHttpMethod[method])
    }

  })
}

