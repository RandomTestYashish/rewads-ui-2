import { el } from "../lib/dom.js";
import { BANNERS, Banner } from "./Banner.js";
import { sectionHead } from "./PlayAndWin.js";

/** The Advantage Club: the Zakir Khan banner again, at 343px wide. */
export function Club() {
  const section = el(`
    <section class="club reveal" id="club">
      ${sectionHead({ title: "The advantage Club", sub: "Postpaid exclusive", logo: "club" })}
      <div class="club__banner"></div>
    </section>
  `);
  section.querySelector(".club__banner").append(Banner(BANNERS[0]));
  return section;
}
