import send from '@polka/send';
import get_posts from './_posts.js';
import { getLocaleFromRequest } from '../../i18n.js'

const lookup = new Map();

export function get(req, res) {
	const locale = getLocaleFromRequest(req);
	const slugWithLocale = locale ? req.params.slug + '.' + locale : req.params.slug;

	let post = lookup.get(slugWithLocale);
	if (!lookup || process.env.NODE_ENV !== 'production') {
		get_posts(locale).forEach(post => {
			const key = post.locale ? post.slug + '.' + post.locale : post.slug;
			lookup.set(key, post);
		});
		post = lookup.get(slugWithLocale);
	}

	if (post) {
		res.setHeader('Cache-Control', `max-age=${5 * 60 * 1e3}`); // 5 minutes
		send(res, 200, post);
	} else {
		send(res, 404, { message: 'not found' });
	}
}
