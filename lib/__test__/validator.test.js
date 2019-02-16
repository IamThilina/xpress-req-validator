import validator from '../validator';
import {
    GET,
    POST,
    DELETE,
    PUT,
    USER_AUTHENTICATE_PATH_PATTERN,
    USER_ID_PATH_PATTERN,
    USER_INFO_PATH_PATTERN,
    USER_FRIENDS_PATH_PATTERN,
    USER_PATH_PATTERN,
    configObj,
    createRequest,
    joiError,
    libErrorOne,
    libErrorTwo,
    responseError,
    headerValidationError,
    pathValidationError,
    queryValidationError,
    bodyValidationError,
} from './mockdata';
import { HEADER, BODY } from '../constants';

describe('unit tests for validator module', () => {
    describe('unit test suites for decorateError()', () => {
        test('handles Joi errors as expected', () => {
            expect(validator.decorateError(joiError, BODY)).toEqual(
                libErrorOne
            );
        });
        test('handles non Joi errors as expected', () => {
            expect(validator.decorateError({}, HEADER)).toEqual(libErrorTwo);
        });
    });

    describe('unit test suites for init()', () => {
        test('set passed config object as a class variable', () => {
            validator.init(configObj);
            expect(validator.configObj).toEqual(configObj);
        });
        test('closure returns a function as expected ', () => {
            expect(typeof validator.init(configObj)).toBe('function');
        });
    });

    describe('unit test suites for validate()', () => {
        let validate,
            next,
            res = Object;
        beforeEach(() => {
            validate = validator.init(configObj);
            next = jest.fn();
        });

        test('identify undefined urls as expected', () => {
            validate(createRequest({}), res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(new Error('Invalid URL'));
        });
        test('identify request header validation failures as expected', () => {
            const req = createRequest({
                method: GET,
                pathPattern: USER_AUTHENTICATE_PATH_PATTERN,
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(headerValidationError);
        });
        test('identify request path validation failures as expected', () => {
            const req = createRequest({
                method: POST,
                pathPattern: USER_INFO_PATH_PATTERN,
                path: {
                    id: 'xyz',
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(pathValidationError);
        });
        test('identify request query validation failures as expected', () => {
            const req = createRequest({
                method: GET,
                pathPattern: USER_FRIENDS_PATH_PATTERN,
                path: {
                    id: 1,
                },
                query: {
                    order: 'Ascending',
                    limit: 25,
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(queryValidationError);
        });
        test('identify request body validation failures as expected', () => {
            const req = createRequest({
                method: POST,
                pathPattern: USER_PATH_PATTERN,
                path: {
                    id: 1,
                },
                body: {
                    username: 'John Doe',
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(bodyValidationError);
        });
        test('identify request header validation success as expected', () => {
            const req = createRequest({
                method: GET,
                pathPattern: USER_AUTHENTICATE_PATH_PATTERN,
                header: {
                    accessToken: 'xyzabc123qjdkslo9db3jdAAM',
                    refreshToken: 'IDM267493001sjdthwncooZZZ',
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify request path validation success as expected', () => {
            const req = createRequest({
                method: DELETE,
                pathPattern: USER_ID_PATH_PATTERN,
                path: {
                    id: 1,
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify request query validation success as expected', () => {
            const req = createRequest({
                method: PUT,
                pathPattern: USER_ID_PATH_PATTERN,
                path: {
                    id: 1,
                },
                body: {
                    age: 25,
                    interests: ['soccer', 'rugby', 'trolling'],
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify request body validation success as expected', () => {
            const req = createRequest({
                method: POST,
                pathPattern: USER_PATH_PATTERN,
                body: {
                    username: 'johnDoe',
                    password: 'xydnqjhd',
                    birthyear: 2000,
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('unit tests suites for responseWithError()', () => {
        let res,
            json = jest.fn(),
            status = jest.fn().mockReturnValue({ json }),
            badRequest = 400;
        beforeEach(() => {
            res = {
                status,
            };
        });

        test('response successfully with given error and status', () => {
            validator.responseWithError(libErrorOne, badRequest, res);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(badRequest);
            expect(json).toHaveBeenCalledTimes(1);
            expect(json).toHaveBeenCalledWith(responseError);
        });
    });
});