import base64
import hashlib
import json
import mitmproxy
from mitmproxy import http
from mitmproxy.tools.web.app import cert_to_json
from mitmproxy.utils.strutils import always_str
from mitmproxy.utils.emoji import emoji
from mitmproxy.dns import DNSFlow
from mitmproxy.http import HTTPFlow
from mitmproxy.tcp import TCPFlow
from mitmproxy.udp import UDPFlow


def flow_to_json(flow: mitmproxy.flow.Flow) -> dict:
    """
    `flow_to_json` method taken from `mitmproxy/tools/web/app.py` modified to also include content.
    """
    f = {
        "id": flow.id,
        "intercepted": flow.intercepted,
        "isReplay": flow.is_replay,
        "type": flow.type,
        "modified": flow.modified(),
        "marked": emoji.get(flow.marked, "🔴") if flow.marked else "",
        "comment": flow.comment,
        "timestampCreated": flow.timestamp_created,
    }

    if flow.client_conn:
        f["clientConn"] = {
            "id": flow.client_conn.id,
            "peername": flow.client_conn.peername,
            "sockname": flow.client_conn.sockname,
            "tlsEstablished": flow.client_conn.tls_established,
            "cert": cert_to_json(flow.client_conn.certificate_list),
            "sni": flow.client_conn.sni,
            "cipher": flow.client_conn.cipher,
            "alpn": always_str(flow.client_conn.alpn, "ascii", "backslashreplace"),
            "tlsVersion": flow.client_conn.tls_version,
            "timestampStart": flow.client_conn.timestamp_start,
            "timestampTlsSetup": flow.client_conn.timestamp_tls_setup,
            "timestampEnd": flow.client_conn.timestamp_end,
        }

    if flow.server_conn:
        f["serverConn"] = {
            "id": flow.server_conn.id,
            "peername": flow.server_conn.peername,
            "sockname": flow.server_conn.sockname,
            "address": flow.server_conn.address,
            "tlsEstablished": flow.server_conn.tls_established,
            "cert": cert_to_json(flow.server_conn.certificate_list),
            "sni": flow.server_conn.sni,
            "cipher": flow.server_conn.cipher,
            "alpn": always_str(flow.server_conn.alpn, "ascii", "backslashreplace"),
            "tlsVersion": flow.server_conn.tls_version,
            "timestampStart": flow.server_conn.timestamp_start,
            "timestampTcpSetup": flow.server_conn.timestamp_tcp_setup,
            "timestampTlsSetup": flow.server_conn.timestamp_tls_setup,
            "timestampEnd": flow.server_conn.timestamp_end,
        }
    if flow.error:
        f["error"] = flow.error.get_state()

    if isinstance(flow, HTTPFlow):
        content_length: int | None
        content_hash: str | None

        if flow.request.raw_content is not None:
            content_length = len(flow.request.raw_content)
            content_hash = hashlib.sha256(flow.request.raw_content).hexdigest()
        else:
            content_length = None
            content_hash = None

        # we base64 encode content and let the client deal with it depending on mimetype
        content = base64.b64encode(flow.request.content).decode() if flow.request.content else None

        # pop the group header we set on validation
        if "X-K6-Group" in flow.request.headers:
            group = flow.request.headers.pop("X-K6-Group")
            f["comment"] = group

        f["request"] = {
            "method": flow.request.method,
            "scheme": flow.request.scheme,
            "host": flow.request.host,
            "port": flow.request.port,
            "path": flow.request.path,
            "httpVersion": flow.request.http_version,
            "headers": tuple(flow.request.headers.items(True)),
            "contentLength": content_length,
            "contentHash": content_hash,
            "timestampStart": flow.request.timestamp_start,
            "timestampEnd": flow.request.timestamp_end,
            "prettyHost": flow.request.pretty_host,
            "content": content,
            "url": flow.request.url,
            "query": tuple(flow.request.query.items(True)),
            "cookies": tuple(flow.request.cookies.items(True)),
        }
        if flow.response:
            if flow.response.raw_content is not None:
                content_length = len(flow.response.raw_content)
                content_hash = hashlib.sha256(flow.response.raw_content).hexdigest()
            else:
                content_length = None
                content_hash = None

            # we base64 encode content and let the client deal with it depending on mimetype
            content = base64.b64encode(flow.response.content).decode() if flow.response.content else None

            f["response"] = {
                "httpVersion": flow.response.http_version,
                "statusCode": flow.response.status_code,
                "reason": flow.response.reason,
                "headers": tuple(flow.response.headers.items(True)),
                "contentLength": content_length,
                "contentHash": content_hash,
                "timestampStart": flow.response.timestamp_start,
                "timestampEnd": flow.response.timestamp_end,
                "content": content,
                "cookies": tuple(flow.request.cookies.items(True)),
            }
            if flow.response.data.trailers:
                f["response"]["trailers"] = tuple(
                    flow.response.data.trailers.items(True)
                )

        if flow.websocket:
            f["websocket"] = {
                "messagesMeta": {
                    "contentLength": sum(
                        len(x.content) for x in flow.websocket.messages
                    ),
                    "count": len(flow.websocket.messages),
                    "timestampLast": flow.websocket.messages[-1].timestamp
                    if flow.websocket.messages
                    else None,
                },
                "closedByClient": flow.websocket.closed_by_client,
                "closeCode": flow.websocket.close_code,
                "closeReason": flow.websocket.close_reason,
                "timestampEnd": flow.websocket.timestamp_end,
            }
    elif isinstance(flow, (TCPFlow, UDPFlow)):
        f["messagesMeta"] = {
            "contentLength": sum(len(x.content) for x in flow.messages),
            "count": len(flow.messages),
            "timestampLast": flow.messages[-1].timestamp if flow.messages else None,
        }
    elif isinstance(flow, DNSFlow):
        f["request"] = flow.request.to_json()
        if flow.response:
            f["response"] = flow.response.to_json()

    return f


def request(flow: http.HTTPFlow) -> None:
    # we don't want to log health check requests to stdout and be captured by the client
    if flow.request.headers.get("X-K6-Studio-Health-Check", "").lower() == "true":
        flow.request.anticache()
        return

    data = flow_to_json(flow)
    data = json.dumps(data)
    print(data, flush=True)


def response(flow: http.HTTPFlow) -> None:
    # we don't want to log health check requests to stdout and be captured by the client
    if flow.request.headers.get("X-K6-Studio-Health-Check", "").lower() == "true":
        flow.request.anticache()
        return

    data = flow_to_json(flow)
    data = json.dumps(data)
    print(data, flush=True)


# we flush it as we want to catch it as soon as it's emitted
print("Proxy Started~", flush=True)
