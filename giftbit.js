
var _ 				= require('underscore');
var request 		= require('request');
var shortid 		= require('shortid');

/*
	API Reference
	http://resources.giftbit.com/api/GiftbitPartnersAPI-v1.5.pdf
*/


var gitftbit = function(options) {
	this.options = _.extend({
		token:  'eyJ0eXAiOiJKV1QiLCJhbGciOiJTSEEyNTYifQ==.bGJJZERoMXdyUU9rZHZ3R0ZxUm5PcUU2Y01tbEcvNVN6VGpvSExPeHFTMmZrOHJKYWhsa3BtLy9WazVjNHVCcWJlRHk3cW1uK0hxcWZpc0V2UGxBYktuZitMMVFKOVdnV3VHcU9jY3JPMVBXb1o4TldsYnFJYlZaSFZJTUY2NHU=.c3aHX4kamJjc/3M2re0Q7FSf9FyqVzCJ5ClrkIltIHY=',
		env:	'test'
	}, options);
	
	switch (this.options.env) {
		default:
		case "test":
			this.options.url	= 'https://testbedapp.giftbit.com/papi/v1';
		break;
		case "prod":
			this.options.url	= 'https://api.giftbit.com/papi/v1';
		break;
	}
	/*
	this.marketplace = {
		regions: 	this.marketplace_regions,
		vendors: 	this.marketplace_vendors,
		categories: this.marketplace_categories,
		get:		this.marketplace_get,
		list:		this.marketplace_list
	}
	*/
}

gitftbit.prototype.GET = function(options, callback, onError) {
	options.data = _.extend({}, options.data);
	
	if (!onError) {
		onError = function(e) {console.log("Error!", e)};
	}
	
	var obj = {
		url:	this.options.url+options.endpoint,
		method: "GET",
		data:	options.data,
		headers:	{
			'Authorization':	'Bearer '+this.options.token
		}
	};
	
	request(obj, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			try {
				callback(JSON.parse(body));
			} catch (e) {
				callback(false);
			}
		} else {
			onError(error);
			callback(false);
		}
	});
	
	return this;
}

gitftbit.prototype.POST = function(options, callback, onError) {
	var scope = this;
	options.data = _.extend({}, options.data);
	
	if (!onError) {
		onError = function(e) {console.log("Error!", e)};
	}
	
	var obj = {
		url:	this.options.url+options.endpoint,
		method: "POST",
		json:	options.data,
		headers:	{
			'Authorization':	'Bearer '+this.options.token
		}
	};
	
	request(obj, function(error, response, body) {
		
		//scope.debug(body);
		callback(body);
		return false;
		
		if (!error) {
			try {
				callback(JSON.parse(body));
			} catch (e) {
				callback(false);
			}
		} else {
			onError(error);
			callback(false);
		}
	});
	
	return this;
}



/*
	Methods
*/


/* Marketplace */
gitftbit.prototype.regions = function(callback) {
	this.GET({
		endpoint:	'/marketplace/regions',
		data:		{}
	}, callback);
}
gitftbit.prototype.vendors = function(callback) {
	this.GET({
		endpoint:	'/marketplace/vendors',
		data:		{}
	}, callback);
}
gitftbit.prototype.categories = function(callback) {
	this.GET({
		endpoint:	'/marketplace/categories',
		data:		{}
	}, callback);
}
gitftbit.prototype.getById = function(id, callback) {
	this.GET({
		endpoint:	'/marketplace/'+id,
		data:		{}
	}, callback);
}
gitftbit.prototype.search = function(query, callback) {
	
	this.debug(query);
	
	this.GET({
		endpoint:	'/marketplace',
		data:		query
	}, callback);
}

gitftbit.prototype.debug = function(input) {
	console.log(JSON.stringify(input, null, 4));
}



gitftbit.prototype.createCampaign = function(options, callback) {
	var scope = this;
	
	options	= _.extend({
		gifts:			[{id:14,value:10}],
		expires:		false,
		id:				shortid.generate(),
		delivery_type:	'SHORTLINK',
		count:			1,
		template:		'WZUMN'
	}, options);
	
	// Rebuiild the parameters
	var data = {};
	data.marketplace_gifts	= _.map(options.gifts, function(item) {
		return {
			id:				item.id,
			price_in_cents:	Math.round(item.value*100)
		}
	});
	if (options.expires) {
		var d		= new Date(options.expires);
		var f = function(n) {
			if (n<=9) {
				n = '0'+n;
			}
			return n;
		}
		data.expiry = f(d.getFullYear())+"-"+f(d.getMonth()+1)+"-"+f(d.getDate())
	}
	data.id				= options.id;
	data.delivery_type	= options.delivery_type;
	data.link_count		= options.count;
	data.gift_template	= options.template;
	
	this.POST({
		endpoint:	'/campaign',
		data:		data
	}, function(response) {
		if (response && response.campaign && response.campaign.id) {
			console.log("> Campaign "+response.campaign.id+" created.");
			callback(response.campaign.id);
		} else {
			console.log("> Campaign creation failed.", response);
			callback(false);
		}
	});
}


gitftbit.prototype.checkLinkStatus = function(id, callback) {
	this.GET({
		endpoint:	'/links/'+id
	}, function(response) {
		if (response && response.shortlinks) {
			console.log("> Found "+response.shortlinks.length+" shortlinks.");
			//callback(response.shortlinks);
			callback(_.map(response.shortlinks, function(item) {
				return item.shortlink
			}));
		} else {
			if (response && response.info && response.info.code == 'INFO_LINKS_GENERATION_IN_PROGRESS') {
				console.log("> Not ready");
				callback({
					inprogress:	true
				});
			} else {
				console.log("> Unknown link status: ", response);
				//callback(response);
				callback({
					inprogress:	true
				});
			}
		}
	});
}


gitftbit.prototype.getLinks = function(options, callback) {
	var scope = this;
	
	options	= _.extend({
		gifts:			[{id:14,value:10}],
		expires:		false,
		id:				shortid.generate(),
		delivery_type:	'SHORTLINK',
		count:			1,
		template:		'WZUMN',
		interval:		5000
	}, options);
	
	this.createCampaign(options, function(campaignId) {
		if (campaignId) {
			var check;
			check = function() {
				scope.checkLinkStatus(campaignId, function(response) {
					if (response.inprogress) {
						// Check again later
						setTimeout(function() {
							check();
						}, options.interval);
					} else {
						callback(response);
					}
				});
			};
			check();
		} else {
			callback(false);
		}
	});
}

module.exports = gitftbit;
