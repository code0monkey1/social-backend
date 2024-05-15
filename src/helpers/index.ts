import fs from "fs";

export default function getDefaultProfileImageAndType() {
    const defaultImageBuffer = fs.readFileSync(
        `${__dirname}/../pics/profile-default.svg`,
    );
    const defaultImageType = "image/svg+xml";

    return { defaultImageBuffer, defaultImageType };
}
