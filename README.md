# giftbit api #


This is a partial implementation of giftbit's API.

You can browse the marketplace, search for gift cards, and order shortlinks. Emails are not supported at this time.

Forks and pull requests are welcome.

## Install ##

	npm install giftbit

## Doc ##

	var giftbitAPI = require('giftbit');
	var giftbit = new giftbitAPI({
		token:	'[your giftbit auth token]',
		env:	'test' // or 'prod'
	});

### Getting the list of regions ###

	giftbit.regions(function(regions) {
		// ...
	});

### Getting the list of vendors ###

	giftbit.vendors(function(vendors) {
		// ...
	});

### Getting the list of categories ###

	giftbit.categories(function(categories) {
		// ...
	});

### Getting a gift card by ID ###

	giftbit.getById(12345, function(response) {
		// ...
	});

### Search for gift cards using parameters ###

Look at the official doc (included in `/doc`) for the parameters accepted by the `/marketplace` endpoint.

	giftbit.search({
		region:		2	// Only the USA
	}, function(response) {
		// ...
	});



### Generate short links ###

	giftbit.createCampaign({
		gifts: [{id:1,value:20}],	// Gift card #1, with a value of $20
		expires: new Date(new Date().getTime()+(1000*60*60*24*7)),	// Expires in 1 week
		count: 5	// generate 5 gift card shortlinks
	}, function(campaignId) {
		// ...
	});


### Check the status of a short links ###

The short links take some time to be created. You need to check their status until it returns the links.

	giftbit.createCampaign({
		gifts: [{id:1,value:20}],	// Gift card #1, with a value of $20
		expires: new Date(new Date().getTime()+(1000*60*60*24*7)),	// Expires in 1 week
		count: 5,	// generate 5 gift card shortlinks
		template: 'WZUMN'	// ID of the template ot use. Create the template on giftbit's site, copy ID from there.
	}, function(response) {
		if (response.inprogress) {
			// Link creation in progress.. Check again later.
		} else {
			// response is an array of links
			/*
			[ 'http://gtbt.co/FMM7AeqKh9Q',
			  'http://gtbt.co/3Us3M6maBK9',
			  'http://gtbt.co/Cb3E7fAJPxY',
			  'http://gtbt.co/gdMkNhTk9Tg',
			  'http://gtbt.co/cQSAD74Acsc' ]
			*/
		}
	});


### Generate and obtain links without checking at an interval ###

Use the same options as createCampaign(), but will only execute the callback once the links are ready. It will take care of checking at an interval, so you don't have to create the logic.

	giftbit.getLinks({
		gifts: [{id:1,value:20}],	// Gift card #1, with a value of $20
		expires: new Date(new Date().getTime()+(1000*60*60*24*7)),	// Expires in 1 week
		count: 5,	// generate 5 gift card shortlinks
		template: 'WZUMN'	// ID of the template ot use. Create the template on giftbit's site, copy ID from there.
	}, function(links) {
		/*
		[ 'http://gtbt.co/FMM7AeqKh9Q',
		  'http://gtbt.co/3Us3M6maBK9',
		  'http://gtbt.co/Cb3E7fAJPxY',
		  'http://gtbt.co/gdMkNhTk9Tg',
		  'http://gtbt.co/cQSAD74Acsc' ]
		*/
	});