
import swaggerDefinitionFile from '../../envConfig/swaggerDefinition.json'
import swaggerJSDoc from 'swagger-jsdoc'

export default swaggerJSDoc({
  swaggerDefinition: swaggerDefinitionFile,
  apis: ['src/controllers/**/*.ts']
})
