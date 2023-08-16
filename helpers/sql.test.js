"use strict";

const { BadRequestError } = require("../expressError");

const { sqlForPartialUpdate } = require("./sql");


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


describe("sql")
