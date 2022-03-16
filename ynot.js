const _ = require('lodash');
const converter = require('json-2-csv');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const BASE_URL = 'https://www.ynot.com';

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

(async () => {
	const categories = await fetchCategories();
	console.log(categories);
})();
