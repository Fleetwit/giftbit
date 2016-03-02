var giftbitAPI	= require('./giftbit');
var fstool		= require('fs-tool');

var giftbit	= new giftbitAPI({
	token:	'',
	env:	'test'
});


var debug = function(input) {
	console.log(JSON.stringify(input, null, 4));
	fstool.file.writeJson("output.json", input, function() {});
}


giftbit.getLinks({
	gifts:			[{id:1,value:20}],
	expires:		new Date(new Date().getTime()+(1000*60*60*24*7)),
	count:			5
}, function(links) {
	console.log("--------------");
	console.log(links);
	console.log("--------------");
});
/*
giftbit.checkLinkStatus('4kqcExx3x', debug);
*/
//giftbit.regions(debug);
/*
giftbit.search({
	region:		2
}, debug);
*/
/*
giftbit.post({
	endpoint:	'/marketplace/vendors',
	data:		{}
}, function(vendors) {
	console.log("vendors",vendors);
});
*/