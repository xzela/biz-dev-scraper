const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.xbiz.com';

const xbizCategories = {
	'Affiliate Programs': {
		url: 'https://www.xbiz.com/directory/affiliate-programs',
		subCategory: {
			'Membership Sites': 'https://www.xbiz.com/directory/affiliate-programs/membership-sites',
			'Clip Sites / Video On Demand': 'https://www.xbiz.com/directory/affiliate-programs/clip-sites-video-on-demand',
			'Dating / Personals': 'https://www.xbiz.com/directory/affiliate-programs/dating--personals',
			'Online Retail': 'https://www.xbiz.com/directory/affiliate-programs/online-retail',
			Other: 'https://www.xbiz.com/directory/affiliate-programs/other',
		},
	},
	'Cam Sites & Services': {
		url: 'https://www.xbiz.com/directory/cam-sites-services',
		subCategory: {
			'Cam Sites': 'https://www.xbiz.com/directory/cam-sites-services/cam-sites',
			'Cam Studios/Agencies': 'https://www.xbiz.com/directory/cam-sites-services/cam-studios-agencies',
		},
	},
	'Studios & Producers': {
		url: 'https://www.xbiz.com/directory/studios-producers',
		subCategory: {
			'Studios & Producers': 'https://www.xbiz.com/directory/studios-producers/studios-producers',
		},
	},
	'Content Licensing': {
		url: 'https://www.xbiz.com/directory/content-licensing',
		subCategory: {
			'Video Content': 'https://www.xbiz.com/directory/content-licensing/video-content',
			'Photo Content': 'https://www.xbiz.com/directory/content-licensing/photo-content',
			'Custom Content': 'https://www.xbiz.com/directory/content-licensing/custom-content',
			Other: 'https://www.xbiz.com/directory/content-licensing/other',
		},
	},
	'Pleasure Products': {
		url: 'https://www.xbiz.com/directory/pleasure-products',
		subCategory: {
			Manufacturers: 'https://www.xbiz.com/directory/pleasure-products/manufacturers',
		},
	},
	'Payment Processing': {
		url: 'https://www.xbiz.com/directory/payment-processing',
		subCategory: {
			'Credit Card Processing': 'https://www.xbiz.com/directory/payment-processing/credit-card-processing',
			'Alternative Payment Solutions': 'https://www.xbiz.com/directory/payment-processing/alternative-payment-solutions',
		},
	},
	'Distributors & Wholesalers': {
		url: 'https://www.xbiz.com/directory/distributors-wholesalers',
		subCategory: {
			'Pleasure Product Distributors': 'https://www.xbiz.com/directory/distributors-wholesalers/pleasure-product-distributors',
			'DVD Distributors': 'https://www.xbiz.com/directory/distributors-wholesalers/dvd-distributors',
		},
	},
	'Creative Services': {
		url: 'https://www.xbiz.com/directory/creative-services',
		subCategory: {
			'Web Design': 'https://www.xbiz.com/directory/creative-services/web-design',
			'Print Design': 'https://www.xbiz.com/directory/creative-services/print-design',
			Printers: 'https://www.xbiz.com/directory/creative-services/printers',
			Other: 'https://www.xbiz.com/directory/creative-services/other',
		},
	},
	'Professional Services': {
		url: 'https://www.xbiz.com/directory/professional-services',
		subCategory: {
			'Legal Services': 'https://www.xbiz.com/directory/professional-services/legal-services',
			'Marketing / PR': 'https://www.xbiz.com/directory/professional-services/marketing--pr',
			'Business Consulting': 'https://www.xbiz.com/directory/professional-services/business-consulting',
			'Business Services': 'https://www.xbiz.com/directory/professional-services/business-services',
		},
	},
	'Tech Services & Solutions': {
		url: 'https://www.xbiz.com/directory/tech-services-solutions',
		subCategory: {
			'Web Hosting': 'https://www.xbiz.com/directory/tech-services-solutions/web-hosting',
			'Web Applications': 'https://www.xbiz.com/directory/tech-services-solutions/web-applications',
			'Desktop Software': 'https://www.xbiz.com/directory/tech-services-solutions/desktop-software',
			'Mobile Services & Solutions': 'https://www.xbiz.com/directory/tech-services-solutions/mobile-services-solutions',
			'Programming / Development': 'https://www.xbiz.com/directory/tech-services-solutions/programming--development',
			Other: 'https://www.xbiz.com/directory/tech-services-solutions/other',
		},
	},
	'Traffic Generation': {
		url: 'https://www.xbiz.com/directory/traffic-generation',
		subCategory: {
			'Ad Networks & Traffic Services': 'https://www.xbiz.com/directory/traffic-generation/ad-networks-traffic-services',
			'Free Adult Sites': 'https://www.xbiz.com/directory/traffic-generation/free-adult-sites',
			'Link Directories & Review Sites': 'https://www.xbiz.com/directory/traffic-generation/link-directories--review-sites',
			'Search Engines': 'https://www.xbiz.com/directory/traffic-generation/search-engines',
			Blogs: 'https://www.xbiz.com/directory/traffic-generation/blogs',
			Other: 'https://www.xbiz.com/directory/traffic-generation/other',
		},
	},
	Retailers: {
		url: 'https://www.xbiz.com/directory/retailers',
		subCategory: {
			Retailers: 'https://www.xbiz.com/directory/retailers/retailers',
		},
	},
	'Video Production': {
		 url: 'https://www.xbiz.com/directory/video-production',
		subCategory: {
			'Production Services': 'https://www.xbiz.com/directory/video-production/production-services',
			'Talent Agencies': 'https://www.xbiz.com/directory/video-production/talent-agencies',
			'DVD Replication & Authoring': 'https://www.xbiz.com/directory/video-production/dvd-replication--authoring',
			'Camera & Sound Equipment': 'https://www.xbiz.com/directory/video-production/camera--sound-equipment',
			'Production Crew / Services': 'https://www.xbiz.com/directory/video-production/production-crew--services',
			'Locations & Sets': 'https://www.xbiz.com/directory/video-production/locations--sets',
			'Sound / Music': 'https://www.xbiz.com/directory/video-production/sound--music',
			Photography: 'https://www.xbiz.com/directory/video-production/photography',
			'Performer Testing': 'https://www.xbiz.com/directory/video-production/performer-testing',
		},
	},
	'Industry Resources': {
		url: 'https://www.xbiz.com/directory/industry-resources',
		subCategory: {
			'News Outlets': 'https://www.xbiz.com/directory/industry-resources/news-outlets',
			Events: 'https://www.xbiz.com/directory/industry-resources/events',
			'Associations / Organizations': 'https://www.xbiz.com/directory/industry-resources/associations--organizations',
			Other: 'https://www.xbiz.com/directory/industry-resources/other',
		},
	},
};

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

async function fetchSubCategories(url) {
	const params = '?show=all';

	const response = await axios.get(`${url}${params}`);
	// console.log(response);
	const $ = cheerio.load(response.data);
	const listings = $('.program-points');
	// console.log(listings);
	listings.find('li').each((index, element) => {
		const name = $(element).text();
	});
}

(async () => {
	// const categories = await fetchCategories('https://www.xbiz.com/directory/affiliate-programs');
	// console.log(categories);
	// return;
	// console.log(xbizCategories);
	for (const category in xbizCategories) {
		const subcatgeories = await fetchCategories(xbizCategories[category].url);
		xbizCategories[category].subCategory = subcatgeories;
	}
	console.log(xbizCategories);
})();
