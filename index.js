const puppeteer = require("puppeteer");

const { user, pass } = require('./loginInfo');
const { connectWithUsers, openBrowser, userList } = require('./config');


const visitPage = async (page, link) => {
  await page.goto(link, { waitUntil: "domcontentloaded" });
  console.log("visiting ", link);
  const connectButton = await page.$("button.pv-s-profile-actions--connect");
  const pendingButton = await page.$(
    'button.pv-s-profile-actions--connect[disabled]'
  );
  if (connectButton !== null) {
    if (!connectWithUsers) return;
    if (pendingButton !== null) {
      return;
    } else {
      console.log('connecting');
      await page.click('button.pv-s-profile-actions--connect');
      await page.click('.artdeco-modal__actionbar > .artdeco-button--primary');
      return;
    }
  }
  try {
    while (!(await page.$("button.pv-profile-section__card-action-bar"))) {
      await page.evaluate(async () => {
        await window.scrollBy(0, 500);
      });
    }

    await page.waitForSelector("button.pv-profile-section__card-action-bar");
    await page.click("button.pv-profile-section__card-action-bar");
    await page.evaluate(async () => {
      const skills = await document.querySelectorAll(
        ".pv-skill-entity__featured-endorse-button-shared"
      );
      if (skills.length > 0) {
        Array.from(skills).forEach(async (skill) => {
          if (skill.innerHTML.includes("plus-icon")) {
            await skill.click();
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    return;
  }
};

const startBrowser = async () => {
  try {
    const browser = await puppeteer.launch({ headless: !openBrowser });
    const page = (await browser.pages())[0];
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto("https://www.linkedin.com/login", {
      waitUntil: "networkidle2",
    });

    await page.type("#username", user);
    await page.type("#password", pass);
    await page.click(".btn__primary--large");
    await page.waitForNavigation();
    for (let link of userList) {
      await visitPage(page, link);
    }
    await browser.close();
  } catch (e) {
    console.log(e);
  }
};

startBrowser();
