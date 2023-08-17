"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given search query data, returns companies that match the search criteria
   *
   * @param {*} queryData => Takes an object that can hold any of the following
   * { numLike, minEmployees, maxEmployees }
   * @returns => {handle, name, description, numEmployees, logoURL} for companies
   * matching search criteria
   */
  static async filterCompanies(queryData) {
    const { where, values } = this.getFilteredQuery(queryData);
    console.log("where clause=", where);
    console.log('values clause=', values);
    const companiesRes = await db.query(`
    SELECT handle,
           name,
           description,
           num_employees AS "numEmployees",
           logo_url AS "logoURL"
    FROM companies
    WHERE ${where}`, [...values]);

    //console.log("companiesRes", companiesRes.rows);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Given an object that holds search query data, return sql-friendly WHERE
   * clause and an array of query values.
   *
   * Excepts any combinations of => { numLike, minEmployees, maxEmployees }
   *
   * Returns  ==> {
   *  where: "name ILIKE %$1% AND num_employees <= $2 AND num_employees >= $3",
   *  values: ['dev', 500, 100]
   *  }
   *
   *  Throws BadRequestErrors if no data was sent or if minEmployees is greater
   *  than maxEmployees
   * */

  static getFilteredQuery(queryData) {
    const keys = Object.keys(queryData);

    if (keys.length === 0) {
      throw new BadRequestError("No data");
    }

    if (Number(queryData.minEmployees) > Number(queryData.maxEmployees)) {
      throw new BadRequestError("minEmployees must be less than maxEmployees");
    }

    const whereQuery = [];

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === "nameLike") {
        whereQuery.push(`name ILIKE $${i + 1}`);
      } else if (keys[i] === "minEmployees") {
        whereQuery.push(`num_employees >= $${i + 1}`);
        queryData.minEmployees = Number(queryData.minEmployees);
      } else if (keys[i] === "maxEmployees") {
        whereQuery.push(`num_employees <= $${i + 1}`);
        queryData.maxEmployees = Number(queryData.maxEmployees);
      }
    };

    console.log("whereQuery=", whereQuery);

    if(queryData.nameLike){
      const val = queryData.nameLike;
      queryData.nameLike = `%${val}%`;
    }

    //   const whereQuery= keys.map((key, idx) => {
    //     if(key === "nameLike"){
    //     `name ILIKE %$${idx + 1}%`;
    //   } else if (key === "minEmployees"){
    //     `num_employees <= $${idx + 1}`;
    //   } else if (key === "maxEmployees") {
    //     `num_employees >= $${idx + 1}`;
    //  }});
    //console.log("whereQuery=", whereQuery);

    return {
      where: whereQuery.join(' AND '),
      values: Object.values(queryData)
    };

  }


  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
