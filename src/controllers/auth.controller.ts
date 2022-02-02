import express, {Request, Response} from 'express'
import { body, validationResult } from 'express-validator';
import CognitoService from '../services/cognito.service';

class  AuthController {
    public path = '/auth'
    public router = express.Router();

    constructor() {
        this.initRoutes();
    }

    public initRoutes(){
        this.router.post('/signup', this.validateBody('signUp'), this.signup)
        this.router.post('/signin', this.validateBody('signIn'), this.signin)
        this.router.post('/verify', this.validateBody('verify'), this.verify)
        this.router.post('/forgotPassword', this.validateBody('forgotPassword'), this.forgotPassword)
        this.router.post('/confirmPassword', this.validateBody('confirmPassword'), this.confirmPassword)
    }

    signup(req: Request, res:Response){
        const result = validationResult(req);
        if(!result.isEmpty()){
            return res.status(422).json({error: result.array()})
        }
        console.log("Signup body is valid")

        const { username, password, email, name,  family_name, birthdate } = req.body;
        let userAttr = [];
        userAttr.push({ Name: 'email', Value: email});
        userAttr.push({ Name: 'birthdate', Value: birthdate.toString()});
        userAttr.push({ Name: 'name', Value: name});
        userAttr.push({ Name: 'family_name', Value: family_name});

        const cognito = new CognitoService();

        cognito.signUpUser(username, password, userAttr)
            .then(success =>{
                if(success){
                   console.log("success -signUpUser--->",success)
                   res.status(200).send("Signup Successfully");
                }else{
                   res.status(500).send("Error in Signup");
                }
            });

    }
    signin(req: Request, res:Response){
        const result = validationResult(req);
        if(!result.isEmpty()){
            return res.status(422).json({error: result.array()})
        }

        const { username, password } = req.body;
        const cognito = new CognitoService();
        cognito.signInUser(username, password)
            .then(success => {
                if(success){
                    res.status(200).send({data: success});
                }else{
                    res.status(500).send("Error in Signin");
                }
            })
    }

    verify(req: Request, res:Response){
        const result = validationResult(req);
        if(!result.isEmpty()){
            return res.status(422).json({error: result.array()})
        }

        const { username, code } = req.body;
        const cognito = new CognitoService();

        cognito.confirmSignUp(username, code)
            .then(success =>{
                if(success){
                    res.status(200).send("Code verified successfully");
                }else{
                    res.status(500).send("Invalid code provided");
                }
            });
    }

    forgotPassword(req: Request, res: Response){
        const result = validationResult(req);
        if (!result.isEmpty()) {
          return res.status(422).json({ errors: result.array() });
        }
        const { username } = req.body;

        let cognito = new CognitoService();
        cognito.forgotPassword(username)
          .then(success => {
            success ? res.status(200).end(): res.status(400).end()
          });
      }

    confirmPassword = (req: Request, res: Response) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
          return res.status(422).json({ errors: result.array() });
        }
        const { username, password, code } = req.body;

        let cognito = new CognitoService();
        cognito.confirmNewPassword(username, password, code)
          .then(success => {
            success ? res.status(200).end(): res.status(400).end()
          })
      }

    private validateBody(type: string){
        switch(type){
            case 'signUp':
                return[
                    body('username').notEmpty().isLength({min: 6}),
                    body('email').notEmpty().normalizeEmail().isEmail(),
                    body('password').isString().isLength({min: 8}),
                    body('birthdate').exists().isISO8601(),
                    body('name').notEmpty().isString(),
                    body('family_name').notEmpty().isString()
                ]
            case 'signIn':
                return[
                    body('username').notEmpty().isLength({min: 6}),
                    body('password').isString().isLength({min: 8})
                ]
            case 'verify':
                return[
                    body('username').notEmpty().isLength({min: 6}),
                    body('code').isString().isLength({min: 6, max:6})
                ]
            case 'forgotPassword':
                return [
                    body('username').notEmpty().isLength({ min: 5}),
                ]
            case 'confirmPassword':
                return [
                    body('password').exists().isLength({ min: 8}),
                    body('username').notEmpty().isLength({ min: 5}),
                    body('code').notEmpty().isString().isLength({min: 6, max: 6})
                ]
        }
    }
}

export default AuthController;