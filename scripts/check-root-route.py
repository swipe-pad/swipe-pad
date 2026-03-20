import re
from html import unescape
from urllib.request import Request, urlopen

URL = "https://app.swipepad.xyz"
req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
html = urlopen(req, timeout=20).read().decode("utf-8", "replace")
visible = re.sub(r"<script[\s\S]*?</script>", " ", html)
visible = re.sub(r"<style[\s\S]*?</style>", " ", visible)
visible = re.sub(r"<[^>]+>", " ", visible)
visible = unescape(re.sub(r"\s+", " ", visible)).strip()
print({
    "status_looks_ok": True,
    "raw_contains_next_not_found_payload": "404: This page could not be found" in html,
    "visible_contains_404": "This page could not be found" in visible,
    "visible_excerpt": visible[:200],
})
