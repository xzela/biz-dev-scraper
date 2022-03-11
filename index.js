const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.xbiz.com';

const xbizCategories = {
	'Affiliate Programs': { url: 'https://www.xbiz.com/directory/affiliate-programs' },
	'Cam Sites & Services': { url: 'https://www.xbiz.com/directory/cam-sites-services' },
	'Studios & Producers': { url: 'https://www.xbiz.com/directory/studios-producers' },
	'Content Licensing': { url: 'https://www.xbiz.com/directory/content-licensing' },
	'Pleasure Products': { url: 'https://www.xbiz.com/directory/pleasure-products' },
	'Payment Processing': { url: 'https://www.xbiz.com/directory/payment-processing' },
	'Distributors & Wholesalers': { url: 'https://www.xbiz.com/directory/distributors-wholesalers' },
	'Creative Services': { url: 'https://www.xbiz.com/directory/creative-services' },
	'Professional Services': { url: 'https://www.xbiz.com/directory/professional-services' },
	'Tech Services & Solutions': { url: 'https://www.xbiz.com/directory/tech-services-solutions' },
	'Traffic Generation': { url: 'https://www.xbiz.com/directory/traffic-generation' },
	Retailers: { url: 'https://www.xbiz.com/directory/retailers' },
	'Video Production': { url: 'https://www.xbiz.com/directory/video-production' },
	'Industry Resources': { url: 'https://www.xbiz.com/directory/industry-resources' },
};

async function fetchCategories(body) {
	const categories = {};
	const $ = cheerio.load(body);
	const listings = $('.file-list');
	listings.find('li').each((index, element) => {
		const category = $(element).text().trim();
		const url = $(element).find('a').attr('href');
		if (!categories[category]) {
			categories[category] = {
				url: `${BASE_URL}${url}`,
			};
		}
	});
	return categories;
}

async function fetchSubCategories(body) {

}

(async () => {
	const response = await axios.get(`${BASE_URL}/directory`);
	// const categories = await fetchCategories(response.data);
	console.log(xbizCategories);

})();
