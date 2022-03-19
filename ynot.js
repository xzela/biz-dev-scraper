const _ = require('lodash');
const converter = require('json-2-csv');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const BASE_URL = 'https://www.ynot.com';
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const ynotCategories = require('./data/ynot.json');

async function wait(mills) {
	return new Promise((resolve) => {
		setTimeout(resolve, mills);
	});
}

async function fetchCategories() {
	const response = await axios.get(`${BASE_URL}/business-directory`);
	const categories = {};
	const $ = cheerio.load(response.data);
	const headings = $('.programs');
	headings.each((index, element) => {
		const title = $(element).find('h3').text().trim();
		categories[title] = {};
		$(element).find('li').each((index, element) => {
			const item = $(element);
			if (item.hasClass('sub')) {
				return;
			}
			const category = item.text().trim();
			const url = item.find('a').attr('href');
			categories[title][category] = url;
		});
	});
	return categories;
}

async function fetchRecord(_url) {
	const response = await axios.get(_url);
	const $ = cheerio.load(response.data);
	const record = {
		Tags: [],
	};

	// parse name
	record.Name = $('.titlearea h2').html();

	// parse contact info
	$('.siteinfo .business p').each((index, element) => {
		const data = $(element).html().trim().split('<br>');
		if (data[0] === 'Business Genre:') {
			record['Business Genre'] = $(data[1]).text();
		}

		if (data[0] === 'Business Website Address:') {
			record['Business Website Address'] = $(data[1]).attr('href');
		}

		if (data[0] === 'Business Numbers:') {
			record['Business Number'] = $($(data[1])[1]).text();
		}

		if (data[0] === 'Business Address:') {
			const text = $(element).contents().text().replace('Business Address:', '').trim().replace(/(\r\n|\n|\r|\t)/gm, '');
			const parts = text.split(/\s{2,}/g);
			const address = parts.join(', ');
			record['Business Address'] = address;
		}
	});

	// parse tags
	$('.details p.tags').find('a').each((index, element) => {
		record.Tags.push($(element).text());
	});

	// parse description
	$('*').remove('p.tags');
	const description = $('.details').text().trim().replace(/(\n)/gm, '');
	record.Description = description;
	return record;
}

async function fetchListings(url, records, page) {
	let pages = `page/${page}`;
	if (page === 1) {
		pages = '';
	}
	const _url = `${url}${pages}`;
	console.log(_url);
	const response = await axios.get(_url);
	const $ = cheerio.load(response.data);
	const listings = $('.afflist');
	if (!listings.length) {
		return records;
	}

	listings.each(async (index, element) => {
		const _url = $(element).find('a.view_more').attr('href');
		records.push(_url);
	});
	page++;
	return fetchListings(url, records, page);
}

(async () => {
	// const __url = 'https://www.ynot.com/business-directory/ynot-category/alternative-online-billing';
	// const records = await fetchListings(__url, [], 1);
	// console.log(records);

	// for (const r in records) {
	// 	const url = records[r];
	// 	await fetchRecord(url);
	// }

	// const recordUrl = 'https://www.ynot.com/business-directory/71256/studio-20/';
	// const recordUrl = 'https://www.ynot.com/business-directory/31065/rabbits-reviews/';
	// const results = await fetchRecord(recordUrl);
	// console.log(results);
	const filePath = './data/ynot-records.json';
	const raw = await readFile(filePath, { encoding: 'utf-8' });
	let data = JSON.parse(raw);
	for (const mainCategory in ynotCategories) {
		const subCategories = ynotCategories[mainCategory];
		for (const subCategory in subCategories) {
			const url = subCategories[subCategory];
			const records = await fetchListings(url, [], 1);
			console.log(`Fetching ${records.length} records for ${subCategory}`);
			for (const record in records) {
				const recordUrl = records[record];
				console.log(recordUrl);
				if (data[recordUrl]) {
					console.log(`Skipping ${recordUrl}`);
					continue;
				}
				const result = await fetchRecord(recordUrl);
				result['Main Category'] = mainCategory;
				result['Sub Category'] = subCategory;
				data[recordUrl] = result;
				// console.log(result);
			}
			await writeFile(filePath, JSON.stringify(data, null, '\t'), {encoding: 'utf-8'});
			data = JSON.parse(await readFile(filePath, { encoding: 'utf-8' }));
		}
	}
})();
