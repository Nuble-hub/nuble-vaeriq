import { strict as assert } from "node:assert";
import { escapeHtml } from "../dist/apps/web/src/escape-html.js";

assert.equal(escapeHtml('INV-001'), 'INV-001');
assert.equal(escapeHtml('<b>invoice</b>'), '&lt;b&gt;invoice&lt;/b&gt;');
assert.equal(
  escapeHtml('"><img src=x onerror="alert(1)">'),
  '&quot;&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
);
assert.equal(escapeHtml("O'Reilly & Sons"), "O&#39;Reilly &amp; Sons");
assert.equal(escapeHtml(undefined), "");
assert.equal(escapeHtml(null), "");
console.log("VAERIQ HTML display escaping regression: PASS");
