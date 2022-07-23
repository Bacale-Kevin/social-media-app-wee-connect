const jwt = require("jsonwebtoken");

/***** This routes verifies the validity of the token  *****/
module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send(`Unauthorized`);
    }

    const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    req.userId = userId
    next()
  } catch (error) {
    console.log(error);
    return res.status(401).send(`Unauthorized`);
  }
};
