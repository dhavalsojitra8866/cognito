import express, {Request, Response} from 'express'
import bodyParser from 'body-parser';
import AuthMiddleware from '../middleware/auth.middleware'

class ProtectedController {
    public path = '/protected'
    public router = express.Router();
    private authMiddleware;

    constructor() {
        this.authMiddleware = new AuthMiddleware();
        this.initRoutes();
    }

    private initRoutes(){
        this.router.use(this.authMiddleware.verifyToken)
        this.router.get('/secret', this.secret)
    }

    secret(req: Request, res:Response){
        res.send("This token is verified")
    }
}

export default ProtectedController;