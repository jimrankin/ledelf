// functions/_middleware.js
// Password gate for the entire site. This file is the ONLY security piece —
// it never needs to change when you update the tutor.
//
// Set these in the Cloudflare dashboard:
//   Pages project -> Settings -> Variables and Secrets
//     AUTH_USER  = your chosen username   (plaintext variable is fine)
//     AUTH_PASS  = your chosen password   (add as a Secret)

export async function onRequest(context) {
  const { request, next, env } = context;

  const user = env.AUTH_USER ?? "you";
  const pass = env.AUTH_PASS;

  const askForLogin = () =>
    new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="French tutor", charset="UTF-8"',
        "content-type": "text/plain; charset=utf-8",
      },
    });

  // Fail closed: if no password is configured, let nobody in.
  if (!pass) return askForLogin();

  const given = request.headers.get("Authorization") || "";
  const expected = "Basic " + btoa(`${user}:${pass}`);
  if (given !== expected) return askForLogin();

  // Authenticated — serve the static page (index.html etc.).
  return next();
}
