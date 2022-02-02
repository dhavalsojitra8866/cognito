import AWS from 'aws-sdk';
import crypto from 'crypto'

class CognitoService {

    private config = {
        region: 'us-east-1'
    }

    private secretHash: string = ''
    private clientId: string = ''
    private cognitoIdentity;

    constructor() {
        this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config);
    }

    //for signup
    public async signUpUser(username: string, password: string, userAttr: Array<any>) {
        try {
            var params = {
                ClientId: this.clientId,
                Password: password,
                Username: username,
                SecretHash: this.generateHash(username),
                UserAttributes: userAttr
            }
            const data = await this.cognitoIdentity.signUp(params).promise();
            console.log("data --->", data);
            return data;
        } catch (error) {
            console.log("SignUpUser Exception ::", error);
            return false;
        }
    }

    //for confirm signup code
    public async confirmSignUp(username: string, code: string): Promise<boolean> {
        const params = {
            ClientId: this.clientId,
            ConfirmationCode: code,
            SecretHash: this.generateHash(username),
            Username: username
        }

        try {
            const data = await this.cognitoIdentity.confirmSignUp(params).promise();
            console.log("data verifyAccount--->", data);
            return data;
        } catch (error) {
            console.log("verifyAccount Exception ::", error);
            return false;
        }

    }

    //for signin user
    public async signInUser(username: string, password: string): Promise<boolean> {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.clientId,
            AuthParameters: {
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': this.generateHash(username)
            }
        }
        try {
            const data = await this.cognitoIdentity.initiateAuth(params).promise()
            console.log("data signInUser--->", data);
            return data;
        } catch (error) {
            console.log("signInUser Exception ::", error);
            return error;
        }
    }

    //for confirm new password
    public async confirmNewPassword(username: string, password: string, code: string): Promise<boolean> {
        var params = {
            ClientId: this.clientId, /* required */
            ConfirmationCode: code, /* required */
            Password: password, /* required */
            Username: username, /* required */
            SecretHash: this.generateHash(username),
        };

        try {
            const data = await this.cognitoIdentity.confirmForgotPassword(params).promise();
            console.log(data);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    //for forgot password
    public async forgotPassword(username): Promise<boolean> {
        var params = {
            ClientId: this.clientId, /* required */
            Username: username, /* required */
            SecretHash: this.generateHash(username),
        }

        try {
            const data = await this.cognitoIdentity.forgotPassword(params).promise();
            console.log(data);
            return true
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    private generateHash(username: string): string {
        return crypto.createHmac('SHA256', this.secretHash)
            .update(username + this.clientId)
            .digest('base64')
    }
}

export default CognitoService;