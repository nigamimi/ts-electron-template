// this source file is derived from "create-react-app@4.0.1" with "yarn eject" command
// for LICENSE of original code, refer to: https://github.com/facebook/create-react-app/blob/v4.0.1/LICENSE

"use strict";

// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
    process() {
        return "module.exports = {};";
    },
    getCacheKey() {
        // The output is always the same.
        return "cssTransform";
    },
};
