'use strict';

const assert = require('assert');

const sharp = require('../../');
const inRange = require('../../lib/is').inRange;
const fixtures = require('../fixtures');

describe('Trim borders', function () {
  it('Threshold default', function (done) {
    const expected = fixtures.expected('alpha-layer-1-fill-trim-resize.png');
    sharp(fixtures.inputPngOverlayLayer1)
      .resize(450, 322)
      .trim()
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual('png', info.format);
        assert.strictEqual(450, info.width);
        assert.strictEqual(322, info.height);
        assert.strictEqual(-204, info.trimOffsetLeft);
        assert.strictEqual(0, info.trimOffsetTop);
        fixtures.assertSimilar(expected, data, done);
      });
  });

  it('Skip shrink-on-load', function (done) {
    const expected = fixtures.expected('alpha-layer-2-trim-resize.jpg');
    sharp(fixtures.inputJpgOverlayLayer2)
      .trim()
      .resize({
        width: 300,
        fastShrinkOnLoad: false
      })
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual('jpeg', info.format);
        assert.strictEqual(300, info.width);
        assert.strictEqual(true, inRange(info.trimOffsetLeft, -873, -870));
        assert.strictEqual(-554, info.trimOffsetTop);
        fixtures.assertSimilar(expected, data, done);
      });
  });

  it('16-bit PNG with alpha channel', function (done) {
    sharp(fixtures.inputPngWithTransparency16bit)
      .resize(32, 32)
      .trim(20)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual('png', info.format);
        assert.strictEqual(32, info.width);
        assert.strictEqual(32, info.height);
        assert.strictEqual(4, info.channels);
        assert.strictEqual(-2, info.trimOffsetLeft);
        assert.strictEqual(-2, info.trimOffsetTop);
        fixtures.assertSimilar(fixtures.expected('trim-16bit-rgba.png'), data, done);
      });
  });

  it('PNG with alpha channel - 100% transparency', function (done) {
    sharp(fixtures.inputPngAlpha100Trim)
      .trim(1)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual('png', info.format);
        assert.strictEqual(76, info.width);
        assert.strictEqual(46, info.height);
        assert.strictEqual(4, info.channels);
        assert.strictEqual(-63, info.trimOffsetLeft);
        assert.strictEqual(-26, info.trimOffsetTop);
        fixtures.assertSimilar(fixtures.expected('trimAlpha100.png'), data, done);
      });
  });

  it('PNG with alpha channel - 50% transparency', function (done) {
    sharp(fixtures.inputPngAlpha50Trim)
      .trim(1)
      .toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual('png', info.format);
        assert.strictEqual(76, info.width);
        assert.strictEqual(46, info.height);
        assert.strictEqual(4, info.channels);
        assert.strictEqual(-63, info.trimOffsetLeft);
        assert.strictEqual(-26, info.trimOffsetTop);
        fixtures.assertSimilar(fixtures.expected('trimAlpha50.png'), data, done);
      });
  });

  it('Attempt to trim 2x2 pixel image fails', function (done) {
    sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: 'red'
      }
    })
      .trim()
      .toBuffer()
      .then(() => {
        done(new Error('Expected an error'));
      })
      .catch(err => {
        assert.strictEqual('Image to trim must be at least 3x3 pixels', err.message);
        done();
      })
      .catch(done);
  });

  describe('Invalid thresholds', function () {
    [-1, 'fail', {}].forEach(function (threshold) {
      it(JSON.stringify(threshold), function () {
        assert.throws(function () {
          sharp().trim(threshold);
        });
      });
    });
  });
});
