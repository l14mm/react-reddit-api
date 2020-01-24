var express = require("express");
var router = express.Router();
var request = require("request");

const OAUTH_API_URL = "https://oauth.reddit.com";
const API_URL = "https://www.reddit.com/api/v1";

router.get("/posts", function(req, res, next) {
  const { query, after, access_token } = req.query;
  request.get(
    `${OAUTH_API_URL}/${query}.json?after=${after}`,
    {
      headers: {
        Authorization: `bearer ${access_token}`,
        "User-Agent": "react-reddit by liam"
      }
    },
    function(error, response, body) {
      res.json(JSON.parse(body));
    }
  );
});

router.get("/refresh", function(req, res, next) {
  const { refresh_token } = req.query;
  const encoded = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");
  request.post(
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encoded}`
      },
      url: `${API_URL}/access_token`,
      form: {
        grant_type: "refresh_token",
        refresh_token
      }
    },
    function(error, response, body) {
      const { access_token, refresh_token, expires_in } = JSON.parse(body);
      request.get(
        `${OAUTH_API_URL}/api/v1/me`,
        {
          headers: {
            Authorization: `bearer ${access_token}`,
            "User-Agent": "react-reddit by liam"
          }
        },
        function(error, response, body) {
          res.json({
            ...JSON.parse(body),
            access_token,
            refresh_token,
            expires_in
          });
        }
      );
    }
  );
});

router.get("/me", function(req, res, next) {
  const { code } = req.query;
  request.get(
    `${OAUTH_API_URL}/api/v1/me`,
    {
      headers: {
        Authorization: `bearer ${code}`,
        "User-Agent": "react-reddit by liam"
      }
    },
    function(error, response, body) {
      console.log("**me", JSON.parse(body));
      res.json(JSON.parse(body));
    }
  );
});

router.get("/", function(req, res, next) {
  const encoded = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");
  request.post(
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encoded}`
      },
      url: `${API_URL}/access_token`,
      form: {
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: "http://localhost:3000/redirect"
      }
    },
    function(error, response, body) {
      const { access_token, refresh_token, expires_in } = JSON.parse(body);
      request.get(
        `${OAUTH_API_URL}/api/v1/me`,
        {
          headers: {
            Authorization: `bearer ${access_token}`,
            "User-Agent": "react-reddit by liam"
          }
        },
        function(error, response, body) {
          console.log("**me1st", {
            ...JSON.parse(body),
            access_token,
            refresh_token,
            expires_in
          });
          res.json({
            ...JSON.parse(body),
            access_token,
            refresh_token,
            expires_in
          });
        }
      );
    }
  );
});

module.exports = router;
