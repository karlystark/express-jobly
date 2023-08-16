"use strict";

const { BadRequestError } = require("../expressError");

const { sqlForPartialUpdate, getFilteredQuery } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("returns the expected output when given jsToSql values", function () {
    const data = { firstName: 'Aliya', lastName: 'Jones', email: 'ajones@gmail.com' };

    const result = sqlForPartialUpdate(
      data,
      {
        firstName: "first_name",
        lastName: "last_name"
      }
    );

    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"last_name\"=$2, \"email\"=$3",
      values: ['Aliya', 'Jones', 'ajones@gmail.com']
    });
  });

  test("returns the expected output when not provided jsToSql values", function () {
    const data = { email: 'ajones@gmail.com' };

    const result = sqlForPartialUpdate(
      data,
      {}
    );

    expect(result).toEqual({
      setCols: "\"email\"=$1",
      values: ['ajones@gmail.com']
    });
  });

  test("returns 400 BadRequestError if dataToUpdate is empty", function () {
    try {
      const result = sqlForPartialUpdate(
        {},
        {}
      );
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


describe("getFilteredQuery", function () {
  test("returns expected results when passed all three queries in queryData",
    function () {
      const result = getFilteredQuery({
        nameLike: "dev",
        minEmployees: "100",
        maxEmployees: "5000"
      });

      expect(result).toEqual({
        where: "name ILIKE %$1% AND num_employees <= $2 AND num_employees >= $3",
        values: ['dev', 100, 5000]
      });
    });


  test("returns expected results when passed two queries in queryData",
  function(){
    const result = getFilteredQuery({
      nameLike: "dev",
      maxEmployees: "5000"
    });

    expect(result).toEqual({
      where: "name ILIKE %$1% AND num_employees >= $2",
      values: ['dev', 5000]
    });
  });

  test("returns expected results when passed one query in queryData",
  function(){
    const result = getFilteredQuery({
      maxEmployees: "5000"
    });

    expect(result).toEqual({
      where: "num_employees >= $1",
      values: [5000]
    });
  });

  test("returns BadRequestError when no data passed", function(){
    try {
    const result = getFilteredQuery({});
    } catch (err){
      expect(err instanceof BadRequestError).toBeTruthy();
    }});

  test("return BadRequestError when minEmployees is greater than maxEmployees",
  function(){
    try {
      const result = getFilteredQuery({
        minEmployees: "5000",
        maxEmployees: "100"
      });
    } catch(err){
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});
