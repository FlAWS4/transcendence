#!/usr/bin/env python3
"""Export the local Figma variable snapshot to deterministic CSS.

Usage: python3 figma/explorations-2026-09/export-tokens.py [--check]
Only the Python standard library is required. Figma font style labels such as
"Regular" and "SemiBold" are metadata, not CSS font-style/weight values.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path


class TokenError(ValueError):
    """The snapshot cannot be exported without losing token meaning."""


def css_name(name: str) -> str:
    result = "--h42-" + name.replace("/", "-")
    if not re.fullmatch(r"--h42-[A-Za-z0-9_-]+", result):
        raise TokenError(f"Unsupported CSS variable name: {name!r}")
    return result


def number(value: float) -> str:
    return f"{value:.6f}".rstrip("0").rstrip(".") or "0"


def is_alias(value: object) -> bool:
    return isinstance(value, dict) and value.get("type") == "VARIABLE_ALIAS"


class TokenExport:
    def __init__(self, source: dict):
        self.collections = source["collections"]
        self.variables = source["variables"]
        self.collection_by_id = self.unique(self.collections, "collection")
        self.variable_by_id = self.unique(self.variables, "variable")
        self.names = {}
        self.mode_maps = {}
        self.cache = {}
        used_css_names = set()
        for collection in self.collections:
            modes = collection["modes"]
            if not modes or len({mode["modeId"] for mode in modes}) != len(modes):
                raise TokenError(f"Missing or duplicate modes: {collection['name']}")
            if len(modes) == 1:
                self.mode_maps[collection["id"]] = dict.fromkeys(
                    ("light", "dark"), modes[0]["modeId"]
                )
            else:
                mapping = {}
                for mode in modes:
                    theme = {"clair": "light", "light": "light",
                             "sombre": "dark", "dark": "dark"}.get(mode["name"].lower())
                    if theme is None or theme in mapping:
                        raise TokenError(f"Unsupported theme mode: {mode['name']}")
                    mapping[theme] = mode["modeId"]
                if set(mapping) != {"light", "dark"}:
                    raise TokenError(f"Both light and dark modes are required: {collection['name']}")
                self.mode_maps[collection["id"]] = mapping

        for variable in self.variables:
            name = css_name(variable["name"])
            if name in used_css_names:
                raise TokenError(f"CSS name collision: {name}")
            used_css_names.add(name)
            self.names[variable["id"]] = name
            collection_id = variable["collectionId"]
            if collection_id not in self.collection_by_id:
                raise TokenError(f"Unknown collection for {variable['name']}: {collection_id}")
            modes = {mode["modeId"] for mode in self.collection_by_id[collection_id]["modes"]}
            if set(variable["values"]) != modes:
                raise TokenError(f"Missing or unknown mode values for {variable['name']}")

        # Validate every mode before any file is written, including unused aliases.
        for variable in self.variables:
            for theme in ("light", "dark"):
                self.resolve(variable["id"], theme)

    @staticmethod
    def unique(items: list, kind: str) -> dict:
        result = {item["id"]: item for item in items}
        if len(result) != len(items):
            raise TokenError(f"Duplicate {kind} IDs")
        return result

    def raw_value(self, variable: dict, theme: str):
        mode = self.mode_maps[variable["collectionId"]][theme]
        return variable["values"][mode]

    def resolve(self, variable_id: str, theme: str, trail: tuple = ()):
        key = (variable_id, theme)
        if key in trail:
            chain = " -> ".join(item[0] for item in (*trail, key))
            raise TokenError(f"Alias cycle: {chain}")
        if key in self.cache:
            return self.cache[key]
        if variable_id not in self.variable_by_id:
            raise TokenError(f"Unknown alias target: {variable_id}")
        variable = self.variable_by_id[variable_id]
        value = self.raw_value(variable, theme)
        if is_alias(value):
            target_id = value.get("id")
            if target_id not in self.variable_by_id:
                raise TokenError(f"Unknown alias target for {variable['name']}: {target_id}")
            if self.variable_by_id[target_id]["type"] != variable["type"]:
                raise TokenError(f"Alias type mismatch for {variable['name']}")
            value = self.resolve(target_id, theme, (*trail, key))
        self.validate_value(variable, value)
        self.cache[key] = value
        return value

    @staticmethod
    def validate_value(variable: dict, value):
        kind = variable["type"]
        if kind == "COLOR":
            if not isinstance(value, dict) or not {"r", "g", "b"}.issubset(value):
                raise TokenError(f"Invalid color: {variable['name']}")
            values = [value[channel] for channel in ("r", "g", "b")] + [value.get("a", 1)]
            if any(isinstance(v, bool) or not isinstance(v, (int, float))
                   or not math.isfinite(v) or not 0 <= v <= 1 for v in values):
                raise TokenError(f"Invalid RGBA channel: {variable['name']}")
        elif kind == "FLOAT":
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
                raise TokenError(f"Invalid number: {variable['name']}")
            if variable["name"] == "opacity/disabled" and not 0 <= value <= 100:
                raise TokenError("opacity/disabled must be a Figma percentage in [0, 100]")
        elif kind == "STRING":
            if not isinstance(value, str):
                raise TokenError(f"Invalid string: {variable['name']}")
        else:
            raise TokenError(f"Unsupported Figma variable type: {kind}")

    def literal(self, variable: dict, value) -> str:
        if variable["type"] == "COLOR":
            red, green, blue = (round(value[channel] * 255) for channel in ("r", "g", "b"))
            return f"rgba({red}, {green}, {blue}, {number(value.get('a', 1))})"
        if variable["type"] == "FLOAT":
            if variable["name"] == "opacity/disabled":
                return number(value / 100)
            return number(value) + "px"
        # CSS escapes, including actual control characters, preserve string labels.
        escaped = "".join(
            "\\" + char if char in ('\\', '"') else
            f"\\{ord(char):x} " if ord(char) < 32 or ord(char) == 127 else char
            for char in value
        )
        return '"' + escaped + '"'

    def declaration(self, variable: dict, theme: str) -> str:
        raw = self.raw_value(variable, theme)
        if is_alias(raw):
            target = self.variable_by_id[raw["id"]]
            # A unitless opacity cannot reference a pixel-valued measurement.
            if (variable["name"] == "opacity/disabled") != (target["name"] == "opacity/disabled"):
                value = self.literal(variable, self.resolve(variable["id"], theme))
            else:
                value = f"var({self.names[raw['id']]})"
        else:
            value = self.literal(variable, raw)
        return f"  {self.names[variable['id']]}: {value};"

    def render(self) -> str:
        lines = [
            "/* Generated by export-tokens.py from figma-tokens.json; do not edit manually.",
            f" * {len(self.variables)} variables across {len(self.collections)} Figma collections.",
            " * font-regular / font-medium / font-strong are Figma style labels.",
            " * They are not CSS font-style values; map them to font-weight in application code.",
            " */", "", ":root {",
        ]
        # Root contains primitives, light semantic aliases, measurements and typography.
        for collection in self.collections:
            variables = [v for v in self.variables if v["collectionId"] == collection["id"]]
            lines.append(f"  /* {collection['name']} */")
            lines.extend(self.declaration(v, "light") for v in variables)
            lines.append("")
        lines[-1] = "}"
        lines.extend(["", '[data-theme="dark"] {'])
        for collection in self.collections:
            if len(collection["modes"]) == 1:
                continue
            variables = [v for v in self.variables if v["collectionId"] == collection["id"]]
            lines.extend(self.declaration(v, "dark") for v in variables)
        lines.append("}")
        return "\n".join(lines) + "\n"

    def contrast_report(self) -> list[str]:
        by_name = {variable["name"]: variable for variable in self.variables}
        pairs = [(foreground, background)
                 for foreground in ("color/text", "color/muted", "color/link", "color/action/quiet")
                 for background in ("color/bg", "color/surface", "color/soft")]
        pairs.extend((f"color/action/on-{state}", f"color/action/{state}")
                     for state in ("primary", "hover", "pressed", "secondary"))
        pairs.extend([
            ("color/onAccent", "color/accent"),
            ("color/onInverse", "color/inverse"),
            ("color/input/placeholder", "color/input/background"),
        ])
        pairs.extend((f"color/{status}", "color/bg")
                     for status in ("error", "warning", "success", "info", "people"))
        warnings = []
        for theme in ("light", "dark"):
            for foreground, background in pairs:
                if foreground not in by_name or background not in by_name:
                    continue
                fg = self.resolve(by_name[foreground]["id"], theme)
                bg = self.resolve(by_name[background]["id"], theme)
                if fg.get("a", 1) != 1 or bg.get("a", 1) != 1:
                    continue  # The real underlying surface is required for alpha compositing.
                luminances = sorted((luminance(fg), luminance(bg)))
                ratio = (luminances[1] + .05) / (luminances[0] + .05)
                if ratio < 4.5:
                    warnings.append(f"{theme}: {foreground} on {background} = {ratio:.2f}:1 (< 4.5:1 for normal text)")
        return warnings


def luminance(color: dict) -> float:
    # Compare the actual 8-bit RGB values emitted into CSS.
    values = [round(color[channel] * 255) / 255 for channel in ("r", "g", "b")]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values]
    return sum(v * weight for v, weight in zip(linear, (.2126, .7152, .0722)))


def main() -> int:
    directory = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=directory / "figma-tokens.json")
    parser.add_argument("--output", type=Path, default=directory.parents[1] / "shared" / "brand" / "tokens.css")
    parser.add_argument("--check", action="store_true", help="Validate the existing CSS without modifying it")
    args = parser.parse_args()
    try:
        export = TokenExport(json.loads(args.input.read_text(encoding="utf-8")))
        result = export.render()
        if args.check:
            if not args.output.exists() or args.output.read_bytes() != result.encode("utf-8"):
                raise TokenError(f"CSS export is missing or out of date: {args.output}")
        else:
            args.output.write_text(result, encoding="utf-8", newline="\n")
    except (OSError, KeyError, TypeError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    dark_count = sum(len(export.collection_by_id[v["collectionId"]]["modes"]) > 1 for v in export.variables)
    print(f"{'Verified' if args.check else 'Exported'} {len(export.variables)} variables, "
          f"{len(export.collections)} collections, {dark_count} dark theme overrides; "
          "all alias targets and cycles checked.")
    for warning in export.contrast_report():
        print(f"CONTRAST: {warning}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
