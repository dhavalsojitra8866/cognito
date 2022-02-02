import exp from 'constants';
import express from 'express';
import { Application } from 'express';

class App{
    public app: Application
    public port: number

    constructor(appInit: {port: number; middlewares: any; controllers: any}){
        this.app = express()
        this.port = appInit.port;

        this.middlewares(appInit.middlewares)
        this.routes(appInit.controllers)
    }

    public listen(){
        this.app.listen(this.port, () =>{
            console.log("App is started on port", this.port);
        })
    }

    private middlewares(middlewares){
        middlewares.forEach(middlewares =>{
            this.app.use(middlewares);
        });
    }

    private routes(controllers){
        controllers.forEach(controllers =>{
            this.app.use(controllers.path, controllers.router);
        });
    }
}
export default App;