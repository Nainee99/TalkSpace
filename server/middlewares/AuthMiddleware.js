import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  console.log(req.cookies);
  const token = req.cookies.jwt;
  console.log({ token });
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the userId to the request object
    req.userId = payload.userId;

    // Proceed to the next middleware
    next();
  });
};
