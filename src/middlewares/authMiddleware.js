const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    else if (!user?.email) {
      return res.status(401).json({ msg: "unauthorized/ invalid user" });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
