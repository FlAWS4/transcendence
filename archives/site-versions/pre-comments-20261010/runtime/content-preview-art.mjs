// Original vector illustrations for fictional entries in the separate preview.
// No remote assets or animation: each cover remains decorative and self-contained.
const illustrations = {
  shell: `
    <rect width="800" height="500" fill="#DCECE7"/>
    <circle cx="690" cy="66" r="190" fill="#BBDDD6"/>
    <circle cx="110" cy="457" r="147" fill="#F2D6E3"/>
    <path d="M617 382h126M680 319v126" stroke="#86BEB3" stroke-width="1.5"/>
    <rect x="125" y="110" width="556" height="310" rx="20" fill="#1C514A" opacity=".10"/>
    <rect x="110" y="94" width="556" height="310" rx="20" fill="#173B38"/>
    <path d="M110 146H666" stroke="#54736A" stroke-width="1"/>
    <circle cx="136" cy="120" r="5" fill="#EC3391"/>
    <circle cx="154" cy="120" r="5" fill="#85AAA0"/>
    <circle cx="172" cy="120" r="5" fill="#00BABC"/>
    <text x="144" y="203" fill="#9DDACB" font-family="monospace" font-size="22">$ ./minishell</text>
    <path d="m147 237 11 9-11 9" stroke="#00BABC" stroke-width="3" fill="none"/>
    <rect x="175" y="241" width="195" height="8" rx="4" fill="#E1EFE7"/>
    <rect x="384" y="241" width="67" height="8" rx="4" fill="#EC3391"/>
    <rect x="145" y="283" width="98" height="7" rx="3.5" fill="#819F94"/>
    <rect x="258" y="283" width="218" height="7" rx="3.5" fill="#486D61"/>
    <rect x="145" y="307" width="172" height="7" rx="3.5" fill="#486D61"/>
    <path d="m147 345 11 9-11 9" stroke="#00BABC" stroke-width="3" fill="none"/>
    <rect x="175" y="342" width="11" height="24" fill="#E9F1E6"/>
    <path d="M67 94V66h28M700 392v28h-28" stroke="#4B9A8D" stroke-width="2" fill="none"/>
  `,
  raycast: `
    <rect width="800" height="500" fill="#102E35"/>
    <path d="M0 0h800L494 166H314Z" fill="#284851"/>
    <path d="M0 500h800L494 334H314Z" fill="#1A3B43"/>
    <path d="M0 0 314 166v168L0 500Z" fill="#4B8D8D"/>
    <path d="M800 0 494 166v168L800 500Z" fill="#216267"/>
    <path d="M0 84 314 195M0 220 314 238M0 380l314-87M96 51v398M209 111v278" stroke="#0A545D" stroke-width="3" opacity=".6"/>
    <path d="M800 84 494 195M800 220l-306 18M800 380l-306-87M705 52v396M594 112v276" stroke="#0E444B" stroke-width="3"/>
    <rect x="314" y="166" width="180" height="168" fill="#163F46"/>
    <path d="M349 334V192h110v142" fill="#07282F"/>
    <path d="M366 334V207h73v127" fill="#E4E8C9"/>
    <path d="m366 334-83 166h259L439 334Z" fill="#A9BDA3" opacity=".18"/>
    <path d="M314 334 0 500M494 334l306 166M350 334 225 500M455 334l125 166M256 365h295M172 410h466M81 458h638" stroke="#A0B0A2" stroke-width="1" opacity=".25"/>
    <path d="M0 0h800" stroke="#EC3391" stroke-width="9"/>
    <circle cx="405" cy="249" r="5" fill="none" stroke="#FFFFFF" stroke-width="1" opacity=".55"/>
    <path d="M35 465h55M35 451h19" stroke="#9AE0D3" stroke-width="3"/>
  `,
  network: `
    <rect width="800" height="500" fill="#F5E4EA"/>
    <circle cx="411" cy="241" r="167" fill="none" stroke="#DDAFC3" stroke-width="1"/>
    <circle cx="411" cy="241" r="235" fill="none" stroke="#E7C6D3" stroke-width="1"/>
    <path d="M157 154 411 241 653 129M411 241l192 161M411 241 154 397M411 241l51-158" stroke="#AD839B" stroke-width="2" fill="none"/>
    <path d="M157 154 411 241 603 402" stroke="#EC3391" stroke-width="3" stroke-dasharray="6 11" fill="none"/>
    <rect x="346" y="176" width="130" height="130" rx="34" fill="#242F38"/>
    <path d="m382 229 14 13-14 13M409 255h26" stroke="#F5E4EA" stroke-width="5" fill="none"/>
    <circle cx="157" cy="154" r="39" fill="#FFFFFF"/>
    <path d="M141 144h32v23h-18l-11 7v-7h-3Z" fill="#00BABC"/>
    <circle cx="653" cy="129" r="29" fill="#FFFFFF"/>
    <rect x="642" y="121" width="22" height="16" rx="5" fill="#D479A3"/>
    <circle cx="603" cy="402" r="46" fill="#EC3391"/>
    <path d="M584 390h37v25h-20l-13 7v-7h-4Z" fill="#FFFFFF"/>
    <circle cx="154" cy="397" r="26" fill="#FFFFFF"/>
    <circle cx="154" cy="397" r="8" fill="#87B8B3"/>
    <circle cx="462" cy="83" r="17" fill="#00BABC"/>
    <circle cx="280" cy="196" r="6" fill="#EC3391"/>
    <circle cx="555" cy="173" r="5" fill="#7D8D94"/>
    <circle cx="510" cy="324" r="6" fill="#EC3391"/>
    <path d="M72 72h24M84 60v24M712 346h18M721 337v18" stroke="#C38CA6" stroke-width="2"/>
  `,
  garden: `
    <rect width="800" height="500" fill="#DCEDE7"/>
    <path d="M0 84h800M0 167h800M0 250h800M0 333h800M0 416h800M80 0v500M240 0v500M400 0v500M560 0v500M720 0v500" stroke="#C5DCD3" stroke-width="1"/>
    <rect x="140" y="96" width="253" height="310" rx="26" fill="#F5F3E9"/>
    <rect x="417" y="96" width="243" height="142" rx="26" fill="#2A5550"/>
    <rect x="417" y="259" width="243" height="147" rx="26" fill="#EFB7CC"/>
    <path d="M265 272v-91" stroke="#27554A" stroke-width="7" fill="none"/>
    <path d="M265 227c-59 0-70-28-70-56 50-1 70 26 70 56Z" fill="#00BABC"/>
    <path d="M266 209c61 0 75-34 75-60-48-1-75 22-75 60Z" fill="#76AE92"/>
    <path d="M223 270h85l-13 53h-59Z" fill="#EC3391"/>
    <rect x="194" y="355" width="142" height="7" rx="3.5" fill="#B3C3B6"/>
    <rect x="217" y="373" width="96" height="5" rx="2.5" fill="#DAE0D4"/>
    <circle cx="469" cy="143" r="16" fill="#00BABC"/>
    <path d="m462 143 5 5 10-10" stroke="#FFFFFF" stroke-width="2" fill="none"/>
    <rect x="504" y="136" width="108" height="7" rx="3.5" fill="#E2EDDB"/>
    <rect x="451" y="184" width="164" height="6" rx="3" fill="#74958A"/>
    <rect x="451" y="203" width="96" height="6" rx="3" fill="#74958A"/>
    <path d="M463 359v-37M498 359v-58M533 359v-45M568 359v-71M603 359v-92" stroke="#9F3F70" stroke-width="15"/>
    <path d="M97 80v35M80 97h35" stroke="#82AEA0" stroke-width="2"/>
    <circle cx="700" cy="433" r="13" fill="#A5C7B8"/>
  `,
  path: `
    <rect width="800" height="500" fill="#ECE8DD"/>
    <path d="M-30 368C102 368 82 153 243 153s148 183 277 183 130-184 307-184" fill="none" stroke="#DAD4C6" stroke-width="102"/>
    <path d="M-30 368C102 368 82 153 243 153s148 183 277 183 130-184 307-184" fill="none" stroke="#F8F6EF" stroke-width="79"/>
    <path d="M-30 368C102 368 82 153 243 153s148 183 277 183 130-184 307-184" fill="none" stroke="#B7B6A6" stroke-width="2" stroke-dasharray="4 10"/>
    <circle cx="162" cy="188" r="31" fill="#00BABC"/>
    <circle cx="162" cy="188" r="9" fill="#FFFFFF"/>
    <circle cx="359" cy="244" r="42" fill="#EC3391"/>
    <path d="m345 244 10 10 19-21" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <circle cx="591" cy="311" r="31" fill="#304F4C"/>
    <circle cx="591" cy="311" r="9" fill="#FFFFFF"/>
    <path d="M161 121V82M360 310v56M591 245v-47" stroke="#A5AA96" stroke-width="1.5"/>
    <circle cx="161" cy="73" r="4" fill="#00BABC"/>
    <circle cx="360" cy="375" r="4" fill="#EC3391"/>
    <circle cx="591" cy="189" r="4" fill="#304F4C"/>
    <path d="M93 431h60M93 448h31M654 60h60M683 77h31" stroke="#B2BBAC" stroke-width="5"/>
    <circle cx="699" cy="405" r="47" fill="#CAD7C7"/>
    <path d="M679 405h40M699 385v40" stroke="#7CA28A" stroke-width="2"/>
  `,
  journal: `
    <rect width="800" height="500" fill="#203F42"/>
    <path d="M0 440 800 90v410H0Z" fill="#294F4F"/>
    <rect x="130" y="70" width="263" height="357" rx="3" fill="#102E33" opacity=".3" transform="rotate(-8 260 250)"/>
    <g transform="rotate(-8 260 250)">
      <rect x="116" y="56" width="263" height="357" rx="3" fill="#F1EFDF"/>
      <path d="M150 105h195M150 116h120" stroke="#87A299" stroke-width="3"/>
      <text x="137" y="271" fill="#EC3391" font-family="Georgia,serif" font-size="165">“</text>
      <rect x="152" y="284" width="172" height="5" fill="#647C70"/>
      <rect x="152" y="303" width="149" height="5" fill="#647C70"/>
      <rect x="152" y="322" width="165" height="5" fill="#647C70"/>
      <rect x="152" y="364" width="57" height="5" fill="#A2B0A0"/>
    </g>
    <g transform="rotate(9 526 268)">
      <rect x="413" y="133" width="232" height="288" rx="3" fill="#00BABC"/>
      <text x="441" y="225" fill="#133D3E" font-family="monospace" font-size="70" font-weight="700">&amp;</text>
      <path d="M445 262h161M445 277h139M445 292h161M445 307h113" stroke="#165F5D" stroke-width="4"/>
      <circle cx="575" cy="369" r="22" fill="#F3E6D8"/>
      <path d="m566 369 7 7 12-13" fill="none" stroke="#256C62" stroke-width="3"/>
    </g>
    <path d="M681 86h35M698 69v35" stroke="#76A69D" stroke-width="2"/>
    <circle cx="77" cy="395" r="8" fill="#EC3391"/>
  `,
};

export function coverArt(kind) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${illustrations[kind] || illustrations.garden}</svg>`;
}
