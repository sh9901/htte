jest.mock('htte-diff', () => jest.fn());
jest.mock('htte-query', () => jest.fn());

const Differ = require('../differ');
const diff = require('htte-diff');
const query = require('htte-query');
const { ContextError } = require('htte-errors');

const store = {};
const unit = {};

function init(parts) {
  return new Differ(store, unit, parts);
}

afterEach(() => jest.clearAllMocks());

describe('#exec', function() {
  test('wrap yaml tag handler', function() {
    let differ = init();
    let handler = jest.fn();
    let literal = {};
    let actual = {};
    differ.exec(handler, literal, actual);
    expect(handler).toHaveBeenCalledWith(differ, literal, actual);
  });
  test('will resolve literal first', function() {
    let differ = init();
    let handler = jest.fn();
    let resolverLiteral = {};
    let literal = jest.fn(() => resolverLiteral);
    let actual = {};
    differ.exec(handler, literal, actual);
    expect(handler).toHaveBeenCalledWith(differ, resolverLiteral, actual);
  });
});

describe('#enter', function() {
  test('enter child scope', function() {
    let differ = init();
    let scopedDiffer = differ.enter('abc');
    expect(scopedDiffer.parts).toEqual(['abc']);
    expect(scopedDiffer).toBeInstanceOf(Differ);
  });
});

describe('#diff', function() {
  test('wrap htte-diff', function() {
    let differ = init();
    let expected = {};
    let actual = {};
    let strict = true;
    differ.diff(expected, actual, strict);
    expect(diff).toHaveBeenCalledWith(differ, expected, actual, strict);
  });
});

describe('#query', function() {
  let queryInner = jest.fn();
  query.mockReturnValue(queryInner);
  test('wrap htte-query', function() {
    let differ = init();
    let path = 'req.body.msg';
    differ.query(path);
    expect(query).toHaveBeenCalledWith(differ.store, differ.unit);
    expect(queryInner).toHaveBeenCalledWith(path);
  });
});

describe('#throw', function() {
  test('wrap msg into ContextError then throw', function() {
    let differ = init(['req', 'body']);
    try {
      differ.throw('abc');
    } catch (err) {
      expect(err).toBeInstanceOf(ContextError);
      expect(err.message).toBe('abc');
      expect(err.parts).toEqual(['req', 'body']);
    }
  });
});
