// import * as jwt from "jsonwebtoken"
// import { JwtSecret } from "../../environments/index"
const JwtSecret = process.env.JWT_SECRET_KEY ;

// const jwt = require('jsonwebtoken');


// const JwtSecret = env("JWT_SECRET_KEY")
const jwt = require("jsonwebtoken");

const getToken = async (data) => {
    const tokenGen = await jwt.sign(data, JwtSecret);
    return tokenGen
}

const exposeToken = async (data) => {

    try {
        const decode = await jwt.verify(data, JwtSecret);
        return decode
    }
    catch (err) {
        return false
    }
}

module.exports = {
    getToken,
    exposeToken
}