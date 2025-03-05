import fs from "fs";

export default function getDefaultProfileImageAndType() {
  const defaultImageBuffer = fs.readFileSync(
    `${__dirname}/../pics/profile-default.svg`,
  );
  const defaultImageType = "image/svg+xml; charset=utf-8";

  return { defaultImageBuffer, defaultImageType };
}
