// import { hash, compare } from 'bcrypt';

// import bcrypt from 'bcrypt';
// import * as bcrypt from "bcrypt";
const bcrypt = require('bcrypt');


const SALT = parseInt(process.env.SALT) ;
/**
 * Returns hashed password by hash password.
 *
 * @remarks
 * This method is part of the {@link utils/password}.
 *
 * @param password - 1st input number
 * @returns The hashed password mean of `password`
 *
 * @beta
 */
const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, SALT);
  return hash;
};

/**
 * Returns boolean by compare password.
 *
 * @remarks
 * This method is part of the {@link utils/password}.
 *
 * @param password - 1st input number
 * @param hash - The second input number
 * @returns The boolean mean of `password` and `hash`
 *
 * @beta
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};


module.exports = {

  hashPassword,comparePassword
}