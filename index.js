const PDFDocument = require("pdfkit");
const fs = require("fs");

const doc = new PDFDocument({
  bufferPages: true,
});

const JOURNAL_YEAR = 2022;
const NOTE_START_PAGE = 12; // REFINE THIS CONSTANT // THIS ACTUALLY STARTS AT 14
const LIGHT_GRAY = "#D3D3D3";
const BLACK = "#000000";
const DARK_GRAY = "#696969";
const EXTRA_PAGES = 25;

const WIDTH = 612;
const LENGTH = 792;
const MARGIN = 72;

let pageCounter = 1;
let dayCounter = 0;
let dayCounterV2 = 0;

// DEFAULT PAGE IS: LETTER (612.00 X 792.00)
// DEFAULT MARGIN IS: 72pts per side
// 72*2 = 144
// 612-144 = 468 (/2 = 231); 612/2 = 306
// 792/2 = 396; -144 = 252

const monthsObj = {
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

const daysInYear = () => {
  return (JOURNAL_YEAR % 4 === 0 && JOURNAL_YEAR % 100 > 0) ||
    JOURNAL_YEAR % 400 == 0
    ? 366
    : 365;
};

const daysInMonth = (month) => {
  return new Date(JOURNAL_YEAR, month, 0).getDate();
};

const dayOfTheWeek = (month, day) => {
  return daysOfWeekObj[new Date(`${JOURNAL_YEAR}, ${month}, ${day}`).getDay()];
};

const makeTwoDigits = (number) => {
  return number > 9 ? "" + number : "0" + number;
};

const datePageLink = () => {
  return NOTE_START_PAGE + dayCounter;
};

const createDottedBackground = () => {
  for (let i = 0; i < LENGTH; i++) {
    doc
      .moveTo(i * 15 + 25, MARGIN / 2)
      .lineTo(i * 15 + 25, LENGTH)
      .dash(1, { space: 15 })
      .stroke();
  }
};

// CREATE NOTE PAGE FOR EACH DAY //
const createDailyPages = (month) => {
  [...Array(daysInMonth(month))].map((_, day) => {
    dayCounterV2++;

    doc.switchToPage(NOTE_START_PAGE + dayCounterV2);
    doc
      .fontSize(16)
      .fillColor(BLACK)
      .text(
        `${dayOfTheWeek(month, day + 1)}, ${
          headerLinks[month - 1]
        } ${makeTwoDigits(day + 1)}`,
        450,
        15,
        {
          align: "center",
          indent: 25,
        }
      );

    // CREATE BOX AROUND DAY OF PAGE
    doc
      .moveTo(480, 0)
      .lineTo(480, 40)
      .moveTo(480, 40)
      .lineTo(WIDTH, 40)
      .strokeColor(BLACK)
      .dash(0.001, { space: 0 })
      .stroke();
  });
};

// CREATE HEADER LINK FOR EVERY PAGE //
const createHeaderLink = () => {
  const pageRange = doc.bufferedPageRange();
  const totalPages = pageRange.count;
  let currPage = 1; // no link headers for title page.

  [...Array(totalPages - 1)].map((i, page) => {
    doc.switchToPage(currPage);
    currPage++;

    [...Array(headerLinks.length)].map((_, i) => {
      doc
        .fontSize(12)
        .fillColor(DARK_GRAY)
        .text(headerLinks[i], 15 + 35 * i, 15, {
          align: "left",
          width: 410,
          wordSpacing: 10,
          link: i + 1,
        })
        .fill(BLACK);
    });

    // ADD LINK TO END FOR NOTES //
    doc
      .fontSize(12)
      .fillColor(DARK_GRAY)
      .text("Notes", 15 + 35 * 12, 15, {
        align: "left",
        width: 410,
        wordSpacing: 10,
        link: 378,
      });
  });
};

const createMonthlyPrompts = () => {
  doc
    .fontSize(14)
    .fillColor(LIGHT_GRAY)
    .text("Month Goal", WIDTH / 2 + 10, MARGIN / 2, {
      oblique: true,
    });

  doc
    .fontSize(14)
    .fillColor(LIGHT_GRAY)
    .text("Notable Dates", MARGIN / 2, LENGTH / 3 + 10, {
      oblique: true,
    });

  doc
    .fontSize(14)
    .fillColor(LIGHT_GRAY)
    .text("Month Reflection", WIDTH / 2 + 10, LENGTH / 3 + 10, {
      oblique: true,
    });
};

// Create Calendar overview pages //
const createCalendarPage = () => {
  // CREATE CALENAR OVERVIEW PAGES //
  Object.keys(monthsObj).forEach((month) => {
    doc.switchToPage(pageCounter);
    pageCounter++;

    // Name of Month //
    doc.fontSize(24).fillColor(BLACK).text(monthsObj[month], 55, 55, {
      align: "left",
      continued: false,
    });

    // Days of the Week Sun-Sat //
    Object.values(daysOfWeekObj).forEach((day) => {
      doc.fontSize(12).fillColor(BLACK).text(day, {
        continued: true,
        columns: 2,
        wordSpacing: 9,
      });
    });

    // Start calendar off on the right day by inserting empty spaces.
    let startingDayOfWeek = new Date(`${JOURNAL_YEAR}, ${month}`).getDay();

    [...Array(startingDayOfWeek)].map((_x, _y) => {
      doc.fontSize(12).text(" ", {
        continued: true,
        wordSpacing: 27.5,
      });
    });

    // Populate each of the days in the month //
    [...Array(daysInMonth(month))].map((_, day) => {
      dayCounter++;

      doc.fontSize(12).text(makeTwoDigits(day + 1), {
        continued: true,
        wordSpacing: 17.5,
        lineGap: 10,
        link: datePageLink(),
      });
    });
    doc.text("", { continued: false }); // Added this to stop the continued:true carry over

    // CREATE MONTHLY PROMPTS //
    createMonthlyPrompts();
    createDailyPages(month);
    createHeaderLink();
  });
};

// CREATE NOTE PAGES + 25 extra pages//
// want custom margin for note pages
console.log(`Creating PDF Journal for ${JOURNAL_YEAR}...`);
[...Array(NOTE_START_PAGE)].map((_, _calendarPages) => {
  doc
    .addPage()
    .moveTo(WIDTH / 2, MARGIN / 2)
    .lineTo(WIDTH / 2, LENGTH - MARGIN / 2)
    .moveTo(45, LENGTH / 3)
    .lineTo(WIDTH - 45, LENGTH / 3)
    .strokeColor(LIGHT_GRAY)
    .stroke();

  createDottedBackground();
});

[...Array(daysInYear() + EXTRA_PAGES - NOTE_START_PAGE)].map(
  (_, _calendarPages) => {
    doc
      .addPage({ margin: 10 })
      .moveTo(WIDTH / 2, MARGIN / 2)
      .lineTo(WIDTH / 2, LENGTH - MARGIN / 2)
      .moveTo(45, LENGTH / 3)
      .lineTo(WIDTH - 45, LENGTH / 3)
      .strokeColor(LIGHT_GRAY)
      .stroke();

    createDottedBackground();
  }
);

// CREATE TITLE PAGE
doc.switchToPage(0);
doc.fontSize(120).text(`Journal for ${JOURNAL_YEAR}`, {
  align: "center",
});

createCalendarPage();

doc.pipe(fs.createWriteStream("./test.pdf"));
console.log("Done.");
doc.end();
