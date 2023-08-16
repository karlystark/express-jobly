"use strict";

const { BadRequestError } = require("../expressError");

/**
 * Translates PATCH data (dataToUpdate) to SQL-friendly string of column names and
 * sanitized values
 *
 * Returns an object containing this SQL-friendly string and an array of the
 * provided PATCH data values
 *
 * Receives:
 * @param {*} dataToUpdate  -- Object that can contain any number of column
 * names and update data values
 *
 * dataToUpdate ==> {firstName: 'Aliya', lastName: 'Jones', email: 'ajones@gmail.com'}
 *
 * @param {*} jsToSql -- Object where keys are Javascript variable names and
 * values are their counterpart SQL column names
 *
 * jsToSQL ==> {firstName: 'first_name', lastName: 'last_name'}
 *
 * @returns An object containing two keys:
 * setCols: a string of column names and their sanitized values
 * ex. "first_name=$1, last_name=$2, email=$3"
 *
 * values: an array of data values that correspond to the sanitized
 * values in setCols
 * ex. ['Aliya', 'Jones', 'ajones@gmail.com']
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  console.log("cols=", cols);
  console.log("join looks like=", cols.join(", "));

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };



/**
 * get request
 * URL key: value pairs
 * nameLike, minEmployees, maxEmployees - only allow these specific keys
 *
 *grab the key and index (for sanitizing purpose)
 * {}

