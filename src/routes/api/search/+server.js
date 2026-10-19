import { json } from '@sveltejs/kit';
import { encryptOne } from '#lib/crypto.js';
import { parsePhoneNumber } from 'libphonenumber-js';

export async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request' }, { status: 400 });
	}

	const raw = String(body?.phone ?? '').trim();

	if (!raw.startsWith('+')) {
		return json(
			{ error: 'Phone must include country code (e.g. +14155552671)' },
			{ status: 400 }
		);
	}

	let parsed;
	try {
		parsed = parsePhoneNumber(raw);
	} catch {
		return json({ error: 'Invalid phone number' }, { status: 400 });
	}

	if (!parsed || !parsed.isValid()) {
		return json({ error: 'Invalid phone number' }, { status: 400 });
	}

	const payload = {
		ccode: encryptOne(`%2B${parsed.countryCallingCode}`),
		number: encryptOne(parsed.nationalNumber),
		version: '7.9.3'
	};

	let upstream;
	try {
		upstream = await fetch('https://api.numberbox.app/search', {
			method: 'POST',
			headers: {
				'User-Agent': 'okhttp/4.12.0',
				'Content-Type': 'application/json; charset=UTF-8',
				Device: 'android'
			},
			body: JSON.stringify(payload)
		});
	} catch {
		return json({ error: 'Network error' }, { status: 502 });
	}

	let data;
	try {
		data = await upstream.json();
	} catch {
		return json({ error: 'Invalid server response' }, { status: 502 });
	}

	return json(data, { status: upstream.status });
}