const PDFDocument = require("pdfkit");
const fs = require("fs");
const { switchToPage } = require("pdfkit");

const doc = new PDFDocument({
  bufferPages: true,
});

const CURRENT_YEAR = 2021;
const NOTE_START_PAGE = 12; // REFINE THIS CONSTANT // THIS ACTUALLY STARTS AT 14
const ACTUAL_NOTE_START_PAGE = 14;

let pageCounter = 1;
let dayCounter = 0;
let dayCounterV2 = 0;

// DEFAULT PAGE IS: LETTER (612.00 X 792.00)
// DEFAULT MARGIN IS: 72pts per side
// 72*2 = 144
// 612-144 = 468 (/2 = 231); 612/2 = 306
// 792/2 = 396; -144 = 252

const monthsObj = {
  // 0: 'January',
  // 1: 'Februrary',
  // 2: 'March',
  // 3: 'April',
  // 4: 'May',
  // 5: 'June',
  // 6: 'July',
  // 7: 'August',
  // 8: 'September',
  // 9: 'October',
  // 10: 'November',
  // 11: 'December'
  1: "January",
  2: "Februrary",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

const headerLinks = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const daysOfWeekObj = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

//   TODO    //
// - index pages for notable pages.
// - calendar view with click link.
// END TODO //

const daysIntoYear = (month, day) => {
  return (
    (Date.UTC(CURRENT_YEAR, month, day) - daysInYear()) / 24 / 60 / 60 / 1000
  );
};

const daysInYear = () => {
  return (CURRENT_YEAR % 4 === 0 && CURRENT_YEAR % 100 > 0) ||
    CURRENT_YEAR % 400 == 0
    ? 366
    : 365;
};

const makeTwoDigits = (number) => {
  return number > 9 ? "" + number : "0" + number;
};

const datePageLink = () => {
  return NOTE_START_PAGE + dayCounter;
};

// CREATE NOTE PAGES //
[...Array(daysInYear() + 1)].map((_, day) => {
  // doc.addPage({ margin: 35 });
  doc.addPage();
});

// CREATE TITLE PAGE
doc.switchToPage(0);
doc.fontSize(120).text("Year of 2021", {
  align: "center",
});

// CREATE CALENAR OVERVIEW PAGES //
Object.keys(monthsObj).forEach((month) => {
  doc.switchToPage(pageCounter);
  pageCounter++;

  let daysInMonth = new Date(CURRENT_YEAR, month, 0).getDate();

  // Name of Month //
  doc.fontSize(24).text(monthsObj[month], 45, 45, {
    align: "left",
    continued: false,
  });

  // Days of the Week Sun-Sat //
  Object.values(daysOfWeekObj).forEach((day) => {
    doc.fontSize(12).text(day, {
      continued: true,
      columns: 2,
      wordSpacing: 9,
    });
  });

  // Start calendar off on the right day by inserting empty spaces.
  // Need -1 because it is 0 index... but getDate() is not...
  let startingDayOfWeek = new Date(CURRENT_YEAR, month - 1).getDay();

  [...Array(startingDayOfWeek + 1)].map((_x, _y) => {
    doc.fontSize(12).text(" ", {
      continued: true,
      wordSpacing: 27.5,
    });
  });

  console.log("MM/DD: ", month, "/", daysInMonth);
  // Populate each of the days in the month //
  [...Array(daysInMonth)].map((_, day) => {
    dayCounter++;

    doc.fontSize(12).text(makeTwoDigits(day + 1), {
      continued: true,
      wordSpacing: 17.5,
      lineGap: 10,
      link: datePageLink(),
    });
  });
  doc.addPage();

  // CREATE NOTE PAGE FOR EACH DAY //
  [...Array(daysInMonth)].map((_, day) => {
    dayCounterV2++;

    doc.switchToPage(NOTE_START_PAGE + dayCounterV2);
    doc
      .fontSize(12)
      .text(`${monthsObj[month]} ${makeTwoDigits(day + 1)}`, 15, 45, {
        align: "center",
      });
  });

  // CREATE HEADER LINK FOR EVERY PAGE //
  const pageRange = doc.bufferedPageRange();
  doc.addPage(); //something about buffered pages not getting the last page //
  const totalPages = pageRange.count;
  console.log("PAGE RANGE: ", pageRange);
  let currPage = 1;

  [...Array(totalPages)].map((i, page) => {
    doc.switchToPage(currPage);
    currPage++;

    [...Array(headerLinks.length)].map((_, i) => {
      doc.fontSize(12).text(headerLinks[i], 15 + 35 * i, 15, {
        align: "left",
        width: 410,
        wordSpacing: 10,
        link: i + 1,
      });
    });
  });
});

doc.pipe(fs.createWriteStream("./test.pdf"));
doc.end();
