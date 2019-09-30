import { builtinModules } from "module";

/*

*/

/*
 */

const path = process.env['METEOR_SHELL_DIR'] + '/../../../public';
const exp = root + 'exp/'
/*

*/

FlowPup = {}

FlowPup.goto = async (url, page, delay) => {
    await page.goto(url, {
      waitUntil: 'load'
    });
  }
  /*
    Screenshot for debugging
   */
  FlowPup.screenshot = async (page, file, fullpage) => {
    if (!page || !file || (/\.(gif|jpg|jpeg|tiff|png)$/i).test(file) == false) {
      console.log('Error in image file or connection')
      return
    };
    Log('screen', 'Screenshot saved:' + file)
    await page.screenshot({
      path: exp + file,
      fullPage: fullpage
    });
  }
  /*
   */
  FlowPup.click = async (page, el, delay, msg) => {
    await page.click(el);
    Log('step', 'Event[click]: ' + msg)
    if (delay && Number.isInteger(delay)) {
      //console.log('Clicked: el', el, 'loading...', delay)
      await page.waitFor(delay);
    }
  }

  module.exports = FlowPup