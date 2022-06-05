import "reflect-metadata"
import path from 'path'
import dotenv from 'dotenv'
import commandLineArgs from 'command-line-args'


(() => {
  const options = commandLineArgs([
    {
      name: 'env',
      alias: 'e',
      defaultValue: 'development',
      type: String,
    }
  ])

  const envConfig = dotenv.config({
    path: path.join(__dirname, `../../envConfig/production.env`),
  })

  if (envConfig.error) {
    throw envConfig.error;
  }
})();


declare global {
  interface String {
    format (args: any[]): string
  }
}

if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments[0];
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
  };
}
