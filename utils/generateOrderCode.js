import { randomBytes } from "node:crypto";

const generateOrderCode = () => {
  return `LUM-${randomBytes(4).toString("hex").toUpperCase()}`;
};

export default generateOrderCode;
