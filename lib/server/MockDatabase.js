"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreCollectionMockDatabase = void 0;
const Database_1 = require("./Database");
/**
 * Create a mock database in PHASE_SETUP, with the Judge, Track, Category, Submission, Prize and SubmissionPrize
 * tables filled in.
 */
function createPreCollectionMockDatabase() {
    let db = new Database_1.Database(":memory:");
    db.begin();
    db.runMany("INSERT INTO Judge(id,name) VALUES(?,?);", [
        [1, "Walter White"],
        [2, "Jesse Pinkman"],
        [3, "Guss Fring"],
        [4, "Mike Ehrmantraut"],
        [5, "Todd Alquist"],
        [6, "Skyler White"],
        [7, "Hank Schrader"],
        [8, "Saul Goodman"],
        [9, "Jane Margolis"],
        [10, "Walter White Jr."],
        [11, "Tuco Salamanaca"],
        [12, "Gale Boetticher"]
    ]);
    db.runMany("INSERT INTO Track(id,name) VALUES(?,?);", [
        [1, "Default Track"],
        [2, "Education Track"],
        [3, "Environment Track"],
        [4, "Health Track"],
        [5, "Maverick Track"]
    ]);
    db.runMany("INSERT INTO Category(id,trackId,name) VALUES(?,?,?);", [
        [1, 1, "Default Category [Default Track]"],
        [2, 2, "Creativity"],
        [3, 2, "Functionality"],
        [4, 2, "Technical Difficulty"],
        [5, 2, "Design"],
        [6, 2, "Usefulness [Education]"],
        [7, 3, "Creativity"],
        [8, 3, "Functionality"],
        [9, 3, "Technical Difficulty"],
        [10, 3, "Design"],
        [11, 3, "Feasibility [Environment]"],
        [12, 4, "Creativity"],
        [13, 4, "Functionality"],
        [14, 4, "Technical Difficulty"],
        [15, 4, "Design"],
        [16, 4, "Impact [Health]"],
        [17, 5, "Creativity"],
        [18, 5, "Functionality"],
        [19, 5, "Technical Difficulty"],
        [20, 5, "Design"],
        [21, 5, "Making a Difference [Maverick]"]
    ]);
    db.runMany("INSERT INTO Prize(id,name) VALUES(?,?);", [
        [1, "Best Rutgers Hack"],
        [2, "Best Solo Hack"],
        [3, "Best Failure to Launch"],
        [4, "Best Hardware Hack"]
    ]);
    db.runMany("INSERT INTO Submission(id,name,url,trackId,location,active) VALUES(?,?,?,?,?,?);", [
        [1, "Test Hack Please Ignore", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 1, 10000, 0],
        [2, "Snapchat for Doctors", "https://hackru-s19.devpost.com/submissions/115289-modularsensor", 3, 14, 1],
        [3, "Uber for Teachers", "https://hackru-s19.devpost.com/submissions/115304-realtrends", 4, 47, 1],
        [4, "Facebook for Cats", "https://hackru-s19.devpost.com/submissions/115309-ruscared", 4, 20, 1],
        [5, "Search for Cats", "https://hackru-s19.devpost.com/submissions/115337-updateme", 5, 28, 1],
        [6, "Snapchat for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 12, 1],
        [7, "Snapchat for Cats", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 13, 1],
        [8, "Facebook for Kids", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 21, 1],
        [9, "Snapchat for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 15, 1],
        [10, "Pintrest for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 3, 1],
        [11, "Search for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 33, 1],
        [12, "Lyft for Teachers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 55, 1],
        [13, "Pintrest for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 10, 1],
        [14, "Facebook for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 19, 1],
        [15, "Snapchat for Doctors", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 14, 1],
        [16, "Facebook for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 18, 1],
        [17, "Search for Kids", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 29, 1],
        [18, "Uber for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 41, 1],
        [19, "Pintrest for Doctors", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 7, 1],
        [20, "Uber for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 42, 1],
        [21, "Snapchat for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 11, 1],
        [22, "Pintrest for Cats", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 5, 1],
        [23, "Facebook for Teachers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 24, 1],
        [24, "Lyft for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 49, 1],
        [25, "Snapchat for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 17, 1],
        [26, "Pintrest for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 4, 1],
        [27, "Search for Doctors", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 30, 1],
        [28, "Lyft for Cats", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 51, 1],
        [29, "Facebook for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 25, 1],
        [30, "Lyft for Doctors", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 53, 1],
        [31, "Search for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 27, 1],
        [32, "Pintrest for Teachers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 9, 1],
        [33, "Snapchat for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 5, 11, 1],
        [34, "Uber for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 48, 1],
        [35, "Uber for Doctors", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 45, 1],
        [36, "Facebook for Doctors", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 22, 1],
        [37, "Search for Chefs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 26, 1],
        [38, "Search for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 31, 1],
        [39, "Lyft for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 56, 1],
        [40, "Snapchat for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 15, 1],
        [41, "Lyft for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 54, 1],
        [42, "Lyft for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 50, 1],
        [43, "Pintrest for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 8, 1],
        [44, "Snapchat for Teachers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 16, 1],
        [45, "Snapchat for Cats", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 13, 1],
        [46, "Pintrest for Kids", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 6, 1],
        [47, "Facebook for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 23, 1],
        [48, "Uber for Kids", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 44, 1],
        [49, "Snapchat for Teachers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 16, 1],
        [50, "Snapchat for Dogs", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 12, 1],
        [51, "Uber for Lawyers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 46, 1],
        [52, "Uber for Cats", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 43, 1],
        [53, "Search for Teachers", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 4, 32, 1],
        [54, "Lyft for Kids", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 2, 52, 1],
        [55, "Snapchat for Professionals", "https://hackru-s19.devpost.com/submissions/115191-boba-connect", 3, 17, 1],
    ]);
    db.runMany("INSERT INTO SubmissionPrize(submissionId,prizeId,eligibility) VALUES(?,?,?);", [
        [2, 1, 1], [2, 3, 1], [2, 4, 1], [3, 1, 1], [3, 3, 1], [3, 4, 1], [4, 1, 1], [4, 2, 1], [5, 1, 1], [5, 3, 1], [5, 4, 1],
        [6, 2, 1], [6, 3, 1], [6, 4, 1], [7, 1, 1], [7, 4, 1], [8, 2, 1], [8, 4, 1], [9, 2, 1], [9, 3, 1], [10, 1, 1], [10, 2, 1],
        [10, 3, 1], [11, 2, 1], [11, 4, 1], [12, 2, 1], [12, 3, 1], [13, 2, 1], [13, 4, 1], [14, 1, 1], [14, 3, 1], [14, 4, 1], [15, 1, 1],
        [15, 3, 1], [15, 4, 1], [16, 1, 1], [17, 1, 1], [17, 2, 1], [17, 3, 1], [17, 4, 1], [18, 1, 1], [18, 2, 1], [18, 3, 1], [18, 4, 1],
        [19, 1, 1], [19, 3, 1], [19, 4, 1], [20, 1, 1], [20, 2, 1], [20, 3, 1], [20, 4, 1], [21, 1, 1], [21, 2, 1], [21, 4, 1], [22, 1, 1],
        [23, 1, 1], [23, 4, 1], [24, 1, 1], [24, 2, 1], [24, 3, 1], [24, 4, 1], [25, 1, 1], [25, 2, 1], [25, 3, 1], [25, 4, 1], [26, 3, 1],
        [26, 4, 1], [27, 1, 1], [27, 3, 1], [27, 4, 1], [28, 1, 1], [28, 4, 1], [29, 4, 1], [30, 1, 1], [30, 3, 1], [31, 1, 1], [31, 2, 1],
        [31, 3, 1], [31, 4, 1], [32, 1, 1], [32, 3, 1], [32, 4, 1], [33, 1, 1], [33, 3, 1], [34, 1, 1], [34, 2, 1], [34, 4, 1], [35, 1, 1],
        [35, 2, 1], [35, 3, 1], [35, 4, 1], [36, 1, 1], [36, 2, 1], [37, 1, 1], [37, 3, 1], [37, 4, 1], [38, 1, 1], [38, 2, 1], [38, 3, 1],
        [39, 3, 1], [40, 2, 1], [40, 4, 1], [41, 2, 1], [41, 3, 1], [42, 1, 1], [42, 2, 1], [42, 3, 1], [43, 1, 1], [43, 2, 1], [43, 4, 1],
        [44, 2, 1], [44, 4, 1], [45, 4, 1], [46, 1, 1], [46, 2, 1], [46, 3, 1], [46, 4, 1], [47, 2, 1], [48, 2, 1], [48, 3, 1], [48, 4, 1],
        [49, 1, 1], [49, 2, 1], [49, 3, 1], [50, 1, 1], [50, 2, 1], [50, 3, 1], [51, 2, 1], [51, 4, 1], [52, 1, 1], [53, 3, 1], [53, 4, 1],
        [54, 1, 1], [54, 3, 1], [54, 4, 1], [55, 1, 1], [55, 3, 1]
    ]);
    db.commit();
    return db;
}
exports.createPreCollectionMockDatabase = createPreCollectionMockDatabase;
//# sourceMappingURL=MockDatabase.js.map