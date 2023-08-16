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
 */

function getFilteredQuery(queryData){
  const keys = Object.keys(queryData);

  if(keys.length === 0){
    throw new BadRequestError("No data");
  }

  if(Number(queryData.minEmployees) > Number(queryData.maxEmployees)){
    throw new BadRequestError("minEmployees must be less than maxEmployees");
  }

  const whereQuery = [];

  for(let i = 0; i < keys.length; i++){
    if(keys[i] === "nameLike"){
      whereQuery.push(`name ILIKE %$${i + 1}%`);
    } else if (keys[i] === "minEmployees"){
      whereQuery.push(`num_employees <= $${i + 1}`);
      queryData.minEmployees = Number(queryData.minEmployees);
    } else if (keys[i] === "maxEmployees") {
      whereQuery.push(`num_employees >= $${i + 1}`);
      queryData.maxEmployees = Number(queryData.maxEmployees);
   }};

//   const whereQuery= keys.map((key, idx) => {
//     if(key === "nameLike"){
//     `name ILIKE %$${idx + 1}%`;
//   } else if (key === "minEmployees"){
//     `num_employees <= $${idx + 1}`;
//   } else if (key === "maxEmployees") {
//     `num_employees >= $${idx + 1}`;
//  }});
console.log("whereQuery=", whereQuery);

return {
  where: whereQuery.join(' AND '),
  values: Object.values(queryData)
};

}


module.exports = {
  sqlForPartialUpdate,
  getFilteredQuery
};