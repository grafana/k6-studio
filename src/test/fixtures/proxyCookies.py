import contextlib
import io
import json
from pathlib import Path
import runpy

from mitmproxy import ctx, http


def running():
    addon = runpy.run_path(
        str(Path(__file__).resolve().parents[3] / "resources" / "json_output.py")
    )
    cases = {
        "different": ["sid=response; Path=/; HttpOnly"],
        "duplicates": ["sid=first; Path=/", "sid=second; Path=/admin; Secure"],
        "empty": ["sid=; Max-Age=0; Path=/"],
        "absent": [],
    }
    results = {}
    for name, cookies in cases.items():
        flow = http.HTTPFlow(None, None)
        flow.request = http.Request.make(
            "GET", "http://example.test/", headers={"Cookie": "old=request"}
        )
        flow.response = http.Response.make(
            200, b"ok", [(b"Set-Cookie", cookie.encode()) for cookie in cookies]
        )
        output = io.StringIO()
        try:
            with contextlib.redirect_stdout(output):
                addon["response"](flow)
            data = json.loads(output.getvalue())
            results[name] = {
                "requestCookies": data["request"]["cookies"],
                "responseCookies": data["response"]["cookies"],
                "responseHeaders": data["response"]["headers"],
            }
        except Exception as error:
            results[name] = {"error": str(error)}
    print("COOKIE_RESULTS:" + json.dumps(results), flush=True)
    ctx.master.shutdown()
