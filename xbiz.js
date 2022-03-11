const _ = require('lodash');
const converter = require('json-2-csv');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const BASE_URL = 'https://www.xbiz.com';

const xbizCategories = require('./data/xbiz.json');

async function wait(mills) {
	return new Promise((resolve) => {
		setTimeout(resolve, mills);
	});
}

async function fetchCategories(categoriesUrl) {
	const response = await axios.get(categoriesUrl);
	const categories = {};
	const $ = cheerio.load(response.data);
	const listings = $('.file-list');
	listings.find('li').each((index, element) => {
		const category = $(element).text().trim();
		// console.log(category);
		const url = $(element).find('a').attr('href');
		// console.log(url);
		categories[category] = `${BASE_URL}${url}`;
	});
	// await wait(2000);
	// console.log(categories);
	return categories;
}

async function fetchListing(url, category, subcategory) {
	const params = '?show=all';
	const response = await axios.get(`${url}${params}`);
	const $ = cheerio.load(response.data);
	const listings = $('.program-points');

	const records = [];
	listings.find('li').each((index, element) => {
		const record = {
			category,
			subcategory,
			name: $(element).find('a').text(),
			url: $(element).find('a').attr('href'),
			description: Buffer.from($(element).find('span.text').text(), 'utf-8').toString(),
		};
		records.push(record);
	});
	return records;
}

(async () => {
	let store = [];
	for (const category in xbizCategories) {
		for (const subCategory in xbizCategories[category].subCategory) {
			const url = xbizCategories[category].subCategory[subCategory];
			const records = await fetchListing(url, category, subCategory);
			console.log('store', store.length);
			console.log('records', records.length);
			store = _.concat(store, records);
			console.log('store', store.length);
		}
	}
	const csvOptions = {
		delimiter: {
			wrap: '"',
		},
		emptyFieldValue: '',
		trimFieldValues: true,
	};
	converter.json2csv(store, csvOptions, (error, csv) => {
		if (error) {
			throw error;
		}

		fs.writeFile('./xbiz.csv', csv, { encoding: 'utf-8'}, (error, results) => {
			if (error) {
				throw error;
			}
		});
	});
})();
