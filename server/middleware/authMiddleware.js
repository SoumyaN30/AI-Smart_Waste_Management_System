const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.authorization) {
      token = req.headers.authorization;
    }

    if (!token) {
      return res.status(401).json({
        msg: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Token is not valid",
    });
  }
};

module.exports = {
  protect,
};