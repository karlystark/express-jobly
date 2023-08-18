"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/*
 await db.query(`
      INSERT INTO jobs( title,
                        salary,
                        equity,
                        company_handle)
      VALUES ('program manager', 55000, '0.02', 'axios'),
             ('english teacher', 75000, '0.0', 'wildthorn elementary'),
             ('rocket scientist', 250000, '0.05', 'nasa')`);

*/

/************************************** create */

describe("create", function(){

  const newJob = {
    title: "math teacher",
    salary: 65000,
    equity: "0.0",
    companyHandle: 'houston middle school'
  };

  test("works", async function(){
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
          FROM jobs
          WHERE title = 'math teacher'`);
    expect(result.rows).toEqual([
      {
        title: "math teacher",
        salary: 65000,
        equity: "0.0",
        companyHandle: "houston middle school"
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function(){
  test("works: no filter", async function(){
    let jobs = await Job.findAll();
    expect(companies).toEqual([
        {
          title: 'program manager',
          salary: 55000,
          equity: '0.02',
          companyHandle:'axios'
        },
        {
          title: 'english teacher',
          salary: 75000,
          equity: '0.0',
          companyHandle:'wildthorn elementary'
        },
        {
          title: 'rocket scientist',
          salary: 250000,
          equity: '0.05',
          companyHandle:'nasa'
        },
    ]);
  });
});

/************************************** get */

describe("get", function(){
  test("works", async function(){
    let job = await Job.get(1);
    expect(job).toEqual({
      title: 'program manager',
      salary: 55000,
      equity: '0.02',
      companyHandle:'axios'
    });
  });

  test("not found if no such company", async function(){
    try{
      await Job.get("nope");
      throw new Error ("fail test, you shouldn't get here");
    } catch(err){
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function(){
  const updateData = {
    title: 'new',
    salary: 10000,
    equity: '0.003'
  };

  test("works", async function(){
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, companyHandle
        FROM jobs
        WHERE id = 1`);

    expect(result.rows).toEqual([
      {
        id: 1,
        title: 'new',
        salary: 10000,
        equity: '0.003',
        companyHandle: 'axios'
      }
    ]);
  });

  test("works: null fields", async function (){
    const updateWithNulls = {
      title: 'new',
      salary: null,
      equity: null
    };

    let job = await Job.update(1, updateWithNulls);
    expect(job).toEqual({
      id: 1,
      ...updateWithNulls,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, companyHandle
          FROM jobs
          WHERE id = 1`);
    expect(result.rows).toEqual([
      {
        id: 1,
        title: 'new',
        salary: null,
        equity: null,
        companyHandle: 'axios'
      }
    ]);
  });

  test("not found if no such job", async function(){
    try{
      await Job.update('nope', updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch(err){
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function(){
    try{
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch(err){
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** remove */