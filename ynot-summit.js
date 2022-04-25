const converter = require('json-2-csv');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const BASE_URL = 'https://www.ynotsummit.com/speakers/';
const util = require('util');

const writeFile = util.promisify(fs.writeFile);
const json2csv = util.promisify(converter.json2csv);

async function fetchSpeakerLinks(_url) {
	const response = await axios.get(_url);
	const speakers = [];
	const $ = cheerio.load(response.data);
	const figure = $('figure');
	figure.each((index, element) => {
		const link = $(element).find('a.profile-img').attr('href');
		speakers.push(link);
	});
	return speakers;
}

async function fetchSpeakerData(_url) {
	const response = await axios.get(_url);
	const $ = cheerio.load(response.data);
	const speaker = {};

	speaker.URL = _url;
	speaker.Name = $('article header .title').text().trim();
	speaker.Title = $('article header .subtitle').text().trim();
	speaker.Image = $('article header figure img').attr('data-src');

	// social records here
	$('article header ul li a').each((index, element) => {
		const social = $(element).attr('class');
		// twitter: sp-tw
		if (social === 'sp-tw') {
			speaker.Twitter = $(element).attr('href');
		}
		// instagram: sp-insta
		if (social === 'sp-insta') {
			speaker.Instagram = $(element).attr('href');
		}

		// facebook: sp-fb
		if (social === 'sp-fb') {
			speaker.Facebook = $(element).attr('href');
		}
	});

	// Biography text
	speaker.Biography = $('article header div.lgx-speaker-intro-text').text() || '';
	$('article section p').each((index, element) => {
		const data = $(element).text();
		speaker.Biography += `${data} `;
	});

	speaker.Biography += $('article section blockquote').text().trim();
	return speaker;
}

async function writeCSV(records) {
	const csvOptions = {
		delimiter: {
			wrap: '"',
		},
		emptyFieldValue: '',
		trimFieldValues: true,
		expandArrayObjects: true,
		keys: [
			'Name',
			'Title',
			'Twitter',
			'Instagram',
			'Facebook',
			'Biography',
			'Image',
			'URL',
		],
	};
	const data = [];
	for (const record in records) {
		const item = records[record];
		data.push(item);
	}
	const filename = './ynot-summit.csv';
	const csv = await json2csv(data, csvOptions);
	await writeFile(filename, csv, { encoding: 'utf-8'});
}

(async () => {
	const links = await fetchSpeakerLinks(BASE_URL);

	const data = [];
	for (const record in links) {
		const url = links[record];
		console.log(`Fetching ${url}`);
		const speaker = await fetchSpeakerData(url);
		console.log(`Done with ${speaker.Name}`);
		data.push(speaker);
	}
	await writeCSV(data);
})();
