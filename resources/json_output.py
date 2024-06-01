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
        "is_replay": flow.is_replay,
        "type": flow.type,
        "modified": flow.modified(),
        "marked": emoji.get(flow.marked, "🔴") if flow.marked else "",
        "comment": flow.comment,
        "timestamp_created": flow.timestamp_created,
    }

    if flow.client_conn:
        f["client_conn"] = {
            "id": flow.client_conn.id,
            "peername": flow.client_conn.peername,
            "sockname": flow.client_conn.sockname,
            "tls_established": flow.client_conn.tls_established,
            "cert": cert_to_json(flow.client_conn.certificate_list),
            "sni": flow.client_conn.sni,
            "cipher": flow.client_conn.cipher,
            "alpn": always_str(flow.client_conn.alpn, "ascii", "backslashreplace"),
            "tls_version": flow.client_conn.tls_version,
            "timestamp_start": flow.client_conn.timestamp_start,
            "timestamp_tls_setup": flow.client_conn.timestamp_tls_setup,
            "timestamp_end": flow.client_conn.timestamp_end,
        }

    if flow.server_conn:
        f["server_conn"] = {
            "id": flow.server_conn.id,
            "peername": flow.server_conn.peername,
            "sockname": flow.server_conn.sockname,
            "address": flow.server_conn.address,
            "tls_established": flow.server_conn.tls_established,
            "cert": cert_to_json(flow.server_conn.certificate_list),
            "sni": flow.server_conn.sni,
            "cipher": flow.server_conn.cipher,
            "alpn": always_str(flow.server_conn.alpn, "ascii", "backslashreplace"),
            "tls_version": flow.server_conn.tls_version,
            "timestamp_start": flow.server_conn.timestamp_start,
            "timestamp_tcp_setup": flow.server_conn.timestamp_tcp_setup,
            "timestamp_tls_setup": flow.server_conn.timestamp_tls_setup,
            "timestamp_end": flow.server_conn.timestamp_end,
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

        # let's cleanup the content
        content = ""
        content_type = flow.request.headers.get("content-type")
        if content_type and (content_type.startswith("image") or content_type.startswith("video") or content_type.startswith("audio") or content_type.startswith("message/ohttp-") or content_type.startswith("application/x-protobuf") or content_type.startswith("font/")):
            content = "<redacted content>"
        elif flow.request.content:
            content = flow.request.content.decode()

        f["request"] = {
            "method": flow.request.method,
            "scheme": flow.request.scheme,
            "host": flow.request.host,
            "port": flow.request.port,
            "path": flow.request.path,
            "http_version": flow.request.http_version,
            "headers": tuple(flow.request.headers.items(True)),
            "contentLength": content_length,
            "contentHash": content_hash,
            "timestamp_start": flow.request.timestamp_start,
            "timestamp_end": flow.request.timestamp_end,
            "pretty_host": flow.request.pretty_host,
            "content": content,
        }
        if flow.response:
            if flow.response.raw_content is not None:
                content_length = len(flow.response.raw_content)
                content_hash = hashlib.sha256(flow.response.raw_content).hexdigest()
            else:
                content_length = None
                content_hash = None
            # decode the response and ignore images
            flow.response.decode()
            content_type = flow.response.headers.get("content-type")
            if content_type and (content_type.startswith("image") or content_type.startswith("video") or content_type.startswith("audio") or content_type.startswith("message/ohttp-") or content_type.startswith("application/x-protobuf") or content_type.startswith('font/')):
                content = "<redacted content>"
            else:
                content = flow.response.content.decode()

            f["response"] = {
                "http_version": flow.response.http_version,
                "status_code": flow.response.status_code,
                "reason": flow.response.reason,
                "headers": tuple(flow.response.headers.items(True)),
                "contentLength": content_length,
                "contentHash": content_hash,
                "timestamp_start": flow.response.timestamp_start,
                "timestamp_end": flow.response.timestamp_end,
                "content": str(content),
            }
            if flow.response.data.trailers:
                f["response"]["trailers"] = tuple(
                    flow.response.data.trailers.items(True)
                )

        if flow.websocket:
            f["websocket"] = {
                "messages_meta": {
                    "contentLength": sum(
                        len(x.content) for x in flow.websocket.messages
                    ),
                    "count": len(flow.websocket.messages),
                    "timestamp_last": flow.websocket.messages[-1].timestamp
                    if flow.websocket.messages
                    else None,
                },
                "closed_by_client": flow.websocket.closed_by_client,
                "close_code": flow.websocket.close_code,
                "close_reason": flow.websocket.close_reason,
                "timestamp_end": flow.websocket.timestamp_end,
            }
    elif isinstance(flow, (TCPFlow, UDPFlow)):
        f["messages_meta"] = {
            "contentLength": sum(len(x.content) for x in flow.messages),
            "count": len(flow.messages),
            "timestamp_last": flow.messages[-1].timestamp if flow.messages else None,
        }
    elif isinstance(flow, DNSFlow):
        f["request"] = flow.request.to_json()
        if flow.response:
            f["response"] = flow.response.to_json()

    return f


def request(flow: http.HTTPFlow) -> None:

    data = flow_to_json(flow)
    data = json.dumps(data)
    print(data, flush=True)


def response(flow: http.HTTPFlow) -> None:

    data = flow_to_json(flow)
    data = json.dumps(data)
    print(data, flush=True)


# we flush it as we want to catch it as soon as it's emitted
print("Proxy Started~", flush=True)
