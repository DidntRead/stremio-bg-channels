const { addonBuilder } = require("stremio-addon-sdk")


// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.bg.channels",
	"version": "0.0.1",
	"resources": [
		"catalog",
		"stream"
	],
	"types": [
		"channel"
	],
	"name": "BG Channels",
	"description": "Free online bg channels displayed in stremio",
	"catalogs": [
		{
			"id": "bgchannels",
			"name": "BG Channels",
			"type": "channel"
		}
	],
	idPrefixes: ["bg:"]
}
const channels = [
	{
		id: "bg:bnt1",
		name: "BNT 1",
		poster: "https://tv.bnt.bg/img/bnt1.svg",
		posterShape: "landscape",
		streamUrl: "https://i.cdn.bg/live/4eViE8vGzI",
		referer: "https://tv.bnt.bg/",
		host: "i.cdn.bg",
		type: "channel",
		streamReferer: "http://i.cdn.bg/",
		streamHost: "lb-ts.cdn.bg"
	},
	{
		id: "bg:bnt2",
		name: "BNT 2",
		poster: "https://tv.bnt.bg/img/bnt2.svg",
		posterShape: "landscape",
		streamUrl: "https://cdn.bg/live/ZBPbdxDHm7",
		referer: "https://tv.bnt.bg/",
		host: "i.cdn.bg",
		type: "channel",
		streamReferer: "http://i.cdn.bg/",
		streamHost: "lb-ts.cdn.bg"
	},
	{
		id: "bg:bnt3",
		name: "BNT 3",
		poster: "https://tv.bnt.bg/img/bnt3.svg",
		posterShape: "landscape",
		streamUrl: "https://i.cdn.bg/live/OQ70Ds9Lcp",
		referer: "https://tv.bnt.bg/",
		host: "i.cdn.bg",
		type: "channel",
		streamReferer: "http://i.cdn.bg/",
		streamHost: "lb-ts.cdn.bg"
	},
	{
		id: "bg:bnt4",
		name: "BNT 4",
		poster: "https://tv.bnt.bg/img/bnt4.svg",
		posterShape: "landscape",
		streamUrl: "https://i.cdn.bg/live/ls4wHAbTmY",
		referer: "https://tv.bnt.bg/",
		host: "i.cdn.bg",
		type: "channel",
		streamReferer: "http://i.cdn.bg/",
		streamHost: "lb-ts.cdn.bg"
	},
	{
		id: "bg:btv",
		name: "BTV",
		poster: "https://www.btv.bg/static/bg/microsites/btvnew/img/logo-btv-main.svg",
		type: "channel",
		streamUrl: "https://btvplus.bg/lbin/v3/btvplus/player_config.php?media_id=2110383625&_=",
		referer: "https://btvplus.bg/live/",
		host: "btvplus.bg",
	},
	{
		id: "bg:nova",
		name: "NOVA",
		poster: "https://nstatic.nova.bg/files/nova/images/nova-logo.svg",
		type: "channel",
		streamUrl: "https://i.cdn.bg/live/0OmMKJ4SgY",
		referer: "https://nova.bg/",
		host: "i.cdn.bg",
		streamHeaders: {},
	}
]
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
const builder = new addonBuilder(manifest)

builder.defineStreamHandler(async ({type, id}) => {
	const channel = channels.find(channel => channel.id === id)

	if (!channel) return Promise.resolve({ streams: [] })

	const headers = {
		"Referer": channel.referer,
		"User-Agent": userAgent,
		"Host": channel.host,
	}

	const resp = await fetch(channel.streamUrl, { headers });

	if (!resp.ok) return Promise.resolve({ streams: [] })

	let body = await resp.text();
	body = body.replaceAll('\\"', '"').replaceAll('\\/', '/');
	const matches = body.match(/(\/\/.*?\.m3u8?)(?=[\s'"])/g);

	if (matches) {
		console.info("Found %d m3u8 matches", matches.length);

		console.debug("https:%s", matches[0]);

		let headers = channel.streamHeaders ?? {
			"User-Agent": userAgent,
		};

		if (channel.streamReferer) {
			headers["Referer"] = channel.streamReferer;
		}

		if (channel.streamHost) {
			headers["Host"] = channel.streamHost;
		}

		console.log(headers);

		return Promise.resolve({
			streams: [{
				url: `https:${matches[0]}`,
				behaviorHints: {
					notWebReady: true,
					proxyHeaders: {
						request: headers,
					}
				}
			}]
		});
	} else {
		console.error("No matches found for m3u8");
		console.debug(body);
		return Promise.resolve({ streams: [] })
	}
})

builder.defineCatalogHandler(({type, id}) => {
	return Promise.resolve({ metas: channels })
});

module.exports = builder.getInterface()