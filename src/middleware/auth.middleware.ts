import {Request, Response} from 'express';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

let pems: { [key: string]: any }  = {}

class AuthMiddleware {

    private poolRegion: string = 'us-east-1'
    private userPoolId = 'us-east-1_SLpygaWIy'

    constructor(){
        this.setUp()
    }

    verifyToken(req: Request, res: Response, next): void{
        const token = req.header("Auth");
        console.log(token);
        if(!token) res.status(401).end();

        let decodedJwt: any = jwt.decode(token, {complete: true});
        if(!decodedJwt){
            res.status(401).end();
        }
        console.log("decodedJwt.header.kid ------>",decodedJwt.header.kid)
        let kid = decodedJwt.header.kid;
        let pem = pems[kid];
        console.log("pems[decodedJwt.header.kid] ----------->",pems[kid])
        console.log("pem ----------->",pem)

        if(!pem){
            res.status(401).end()
        }

        jwt.verify(token, pem, (err, payload) =>{
            if(err){
                console.log("err ----------->",err)
                res.status(401).end()
            }else{
                console.log("payload ----------->",payload)
                next()
            }
        })
    }

    private async setUp(){
        const URL = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`

        try{
            const response = await fetch(URL);
            if(response.status !== 200){
                throw `request not successful`
            }

            const data = await response.json();
            const { keys } = data;
            for(let i = 0; i< keys.length; i++){
                const key_id = keys[i].kid;
                const modulus = keys[i].n;
                const exponent = keys[i].e;
                const key_type = keys[i].kty;
                const jwk = { kty: key_type, n: modulus, e: exponent };
                const pem = jwkToPem(jwk);
                pems[key_id] = pem;
            }
            console.log("got PEMS")
        }catch(error){
            console.log('Error! Unable to download JWKs', error);
        }
    }
}

export default AuthMiddleware;