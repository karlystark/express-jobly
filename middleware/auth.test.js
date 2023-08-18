"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

/************************************** authenticateJWT */

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

/************************************** ensureLoggedIn */

describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: { } } };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });
});

/************************************** ensureAdmin */

describe("ensureAdmin", function(){
  test("works if user has admin status", function(){
    const req = {};
    const res = { locals: { user: { username: "u3", isAdmin: true }}};
    ensureAdmin(req, res, next);
  });

  test("returns unauthorized if user does not have admin status", function(){
    const req = {};
    const res = { locals: { user: { username: "u1", isAdmin: false }}};
    expect(()=> ensureAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
})

/************************************** ensureCorrectUserOrAdmin */

describe("ensureCorrectUserOrAdmin", function() {
  test("works if user is the correct user", function(){
    const req =  {params: { username: "test"}};
    const res = { locals: { user: { username: "test", isAdmin: false }}};
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("works if user is an admin", function(){
    const req = {params: { username: "bob"}};
    const res = { locals: { user: { username: "test", isAdmin: true }}};
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("returns unauthorized if no user is logged in", function() {
    const req = {params: { username: "test"}};
    const res = {locals: {} };
    expect(()=> ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("returns unauthorized if no valid login", function(){
    const req = {params: { username: "test"}};
    const res = {locals: {} };
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("returns unauthorized if user is neither an admin nor matches the route username", function(){
    const req = {params: {username: "bob"}};
    const res = {locals: { user: { username: "test", isAdmin: false}}};
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
});



