import { createCipheriv, randomBytes, randomUUID } from 'crypto';
import { CERT_DER_B64 } from './cert.js';

const K128 = Buffer.from('b2c0d351067184fe', 'hex');
const IV128 = Buffer.from('7ae8be8095cbf86f22376ca61b516a5f', 'hex');
const K256 = Buffer.from(
	'8f434346648f6a94df89dda901c5176b10a6d83960dd3b1ac88b59b2dc327aa4',
	'hex'
);
const IV256 = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');
const FILE_SIZE = '52256768';
const CERT_HEX = Buffer.from(CERT_DER_B64, 'base64').toString('hex');

function aes(key, iv, plain) {
	const algo = key.length === 16 ? 'aes-128-cbc' : 'aes-256-cbc';
	const c = createCipheriv(algo, key, iv);
	return Buffer.concat([c.update(plain), c.final()]);
}

function stamp(prefix) {
	return `${prefix}|${randomUUID()}|${Date.now()}`;
}

export function encryptOne(input) {
	const inner = Buffer.from(stamp(CERT_HEX), 'utf8');
	const certB64 = aes(K256, IV256, inner).toString('base64');
	const outer = Buffer.from(`${stamp(`${input}|${certB64}`)}|${FILE_SIZE}`, 'utf8');
	const rand8 = randomBytes(8);
	const ct = aes(Buffer.concat([K128, rand8]), IV128, outer);
	return Buffer.concat([ct, rand8]).toString('base64');
}