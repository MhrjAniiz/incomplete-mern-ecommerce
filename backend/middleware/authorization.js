import jwt from "jsonwebtoken";

const secret = "secretKey";

const userAuthorization = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res
      .status(401)
      .json({ msg: "You don't have the right authorization" });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

export default userAuthorization;
