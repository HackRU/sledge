let mongoose = require('mongoose');

module.exports = {
  // TODO: Randomly generate values for each field
  generateSubmission: function () {
    let testCategoryId = mongoose.Types.ObjectId();
    return {
      state: 'submitted',
      attributes: {
        title: 'A Test Hack',
        description:
          'Our hack is very cool! I like this hack, and my teammates like it too.',
        technologies: ['MongoDB', 'JSON'],
      },
      urls: [
        { label: 'GitHub Repository', url: 'https://github.com/hackru/sledge' },
        { label: 'YouTube Video Demo', url: 'https://youtube.com/idk' },
      ],
      categories: [{ _id: testCategoryId, categoryName: 'Best Beginner Hack' }],
    };
  },
  generateCategory: function () {
    return {
      name: 'Sample Category',
      companyName: null,
      type: 'track',
    };
  },
};
