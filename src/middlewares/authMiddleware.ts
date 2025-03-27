import jwt from "jsonwebtoken";

const authMiddleware = (req: any, res: any, next: any) => {
  const header = req.header("Authorization");

  if (!header) {
    return res
      .status(401)
      .send({ messgae: "Authorization header is required" });
  }

  const token = header.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "test");
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
