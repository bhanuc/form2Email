import * as Router from 'koa-router';


import { decrypt, encrypt } from './util/encrypt';
import { transporter } from './util/transporter';

const router = new Router();

/**
 * Base route, return a 401
 */
router.get('/', async ctx => ctx.status = 200);

router.post('/f/:encrpytedtoken', async ctx => {
    const { body } = ctx.request;
    const {encrpytedtoken} = ctx.params;
    const decryptedEmail = decrypt(encrpytedtoken);
    const {_replyto, _next, _subject, _cc, _gotcha } = body;
    if (_gotcha) {
        if (_next) {
            ctx.redirect(_next);
        }
        ctx.body = { status: true, };
        return ctx.status = 200;
    }
    const mailText = Object.keys(body).map(key => `${key}: ${body[key]}`).join('\n');
    const mailHTML = Object.keys(body).map(key => `<p><b>${key}</b>: ${body[key]}</p>`).join('<br/>');
    const emails = _cc ? [decryptedEmail, _cc] :  [decryptedEmail];
    const message = {
        from: 'Sender Name <sender@example.com>',
        to: emails,
        subject: _subject || 'Email from formit',
        text: mailText,
        html: mailHTML,
        replyTo: _replyto
    };
    try {
        const resp = await transporter.sendMail(message);
        console.log(resp);

        if (_next) {
            ctx.redirect(_next);
        }
        ctx.body = { status: true, };
        ctx.status = 200;
    } catch (error) {
        ctx.body = { status: false, error };
        ctx.status = 200;
    }
    ctx.body = { status: true };
    ctx.status = 200;
});


router.post('/token/generate', async ctx => {
    const { body } = ctx.request;
    if (!body.email) {
        ctx.body = { error: 'Incorrect body' };
        return ctx.status = 400;
    }
    const encryptedEmail = encrypt(body.email);
    ctx.body = { status: true, id: encryptedEmail };
    ctx.status = 200;
});


/**
 * Basic healthcheck
 */
router.get('/healthcheck', async ctx => ctx.body = 'OK');

export const routes = router.routes();
