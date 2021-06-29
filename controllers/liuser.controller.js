const LinkedInUserModel = require("../db/models/LinkedInUserModel");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

exports.getAllLinkedInUsers = async (req, res) => {
  try {
    const { start, count, sortBy, sortOrder, search } = req.query;
    if (!start || !count) {
      return res.status(400).json({ message: "Missing queries" });
    }
    // Sorting
    let sort = {
      createdAt: -1,
    };

    if (sortBy && sortOrder) {
      sort = {
        [sortBy]: Number(sortOrder),
      };
    }

    console.log("Sort: ", sortOrder, sortBy);

    let find = {};

    if (search) {
      find = {
        ...find,
        $or: [
          {
            fullName: { $regex: `${search}`, $options: "i" },
          },
          {
            industryName: { $regex: `${search}`, $options: "i" },
          },
          {
            country: { $regex: `${search}`, $options: "i" },
          },
        ],
      };
    }

    const totalCount = await LinkedInUserModel.countDocuments(find);
    const linkedInUsers = await LinkedInUserModel.find(find)
      .sort(sort)
      .skip(Number(start))
      .limit(Number(count));

    return res.status(200).json({
      data: { resultCount: linkedInUsers.length, liUsers: linkedInUsers },
      meta: { totalResults: totalCount, start: start, limit: count },
    });
  } catch (e) {
    logger.error(`Error in getting all linked in users : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};
