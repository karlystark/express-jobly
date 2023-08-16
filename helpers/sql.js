"use strict";

const { BadRequestError } = require("../expressError");

/**
 * Receives an object of column names and update data and a dictionary of JS/SQL variable names
 * Takes Javascript keys from dataToUpdate and maps their SQL column names to sanitized values
 * Returns an object containing two keys - setCols is a string of column names and their sanitized values,
 * Values is an array of updated column values/data
 *
 *
 *
 *
 * @param {*} dataToUpdate  -- object that can contain any number of data keys/values
 * @param {*} jsToSql -- object keys are javascript variable names, values are sql columns
 * @returns an object containing two keys - setCols is a string of column names and their sanitized values
 * values is an array of updated column values/data
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
