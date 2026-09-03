"""
A cheap structural check for PHP files, for use when no PHP binary is
available. It will not catch everything a real parser catches, but it does
catch the failure that actually bit us: an unclosed alternative-syntax block.

Strings and comments are stripped first, so a brace inside a SQL string or the
word "endif" inside a comment cannot produce a false alarm.
"""
import io, os, re, sys, glob

def strip_noise(src):
    out = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        two = src[i:i+2]
        if two == "//" or c == "#":
            j = src.find("\n", i)
            i = n if j < 0 else j
            continue
        if two == "/*":
            j = src.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in ("'", '"'):
            q = c
            i += 1
            while i < n:
                if src[i] == "\\":
                    i += 2
                    continue
                if src[i] == q:
                    i += 1
                    break
                i += 1
            out.append(" ")
            continue
        if src.startswith("<<<", i):
            m = re.match(r"<<<\s*'?\"?([A-Za-z_]\w*)'?\"?\r?\n", src[i:])
            if m:
                tag = m.group(1)
                end = re.search(r"^\s*" + tag + r"\s*;?", src[i:], re.M)
                i = n if not end else i + end.end()
                out.append(" ")
                continue
        out.append(c)
        i += 1
    return "".join(out)

def php_regions(src):
    """Everything between <?php (or <?=) and the matching ?>, or end of file."""
    out = []
    for m in re.finditer(r"<\?(?:php|=)", src):
        start = m.end()
        close = src.find("?>", start)
        out.append(src[start:close if close >= 0 else len(src)])
    return chr(10).join(out)

def check(path):
    src = io.open(path, encoding="utf-8", errors="replace").read()
    code = strip_noise(php_regions(src))
    problems = []

    # A cron schedule documented inside a block comment ends the comment at its
    # own "*/", and everything after is parsed as PHP. Added 2026-09-03 after
    # import.php shipped as a syntax error and this checker called it sound:
    # it modelled quotes and braces but not comment terminators, so the damage
    # was invisible to every other check here.
    for n, line in enumerate(src.split(chr(10)), 1):
        st = line.strip()
        if st.startswith("*/") and len(st) > 2 and st[2].isdigit():
            problems.append(
                "line %d: a cron schedule closes the block comment: %s" % (n, st[:60]))

    if code.count("{") != code.count("}"):
        problems.append("braces %d open / %d close" % (code.count("{"), code.count("}")))
    if code.count("(") != code.count(")"):
        problems.append("parens %d open / %d close" % (code.count("("), code.count(")")))
    if code.count("[") != code.count("]"):
        problems.append("brackets %d open / %d close" % (code.count("["), code.count("]")))

    # alternative syntax: a colon-form block must be closed
    pairs = [
        (r":\s*(?:\?>|$)", None),
    ]
    # count only colon-form openers, i.e. `if (...):` not `if (...) {`
    def count_colon(kw):
        return len(re.findall(r"\b" + kw + r"\s*\([^;{]*?\)\s*:", code))
    n_if      = count_colon("if") + len(re.findall(r"\belseif\s*\([^;{]*?\)\s*:", code))
    n_endif   = len(re.findall(r"\bendif\b", code))
    n_for     = count_colon("for")
    n_endfor  = len(re.findall(r"\bendfor\b", code))
    n_fe      = count_colon("foreach")
    n_endfe   = len(re.findall(r"\bendforeach\b", code))
    n_while   = count_colon("while")
    n_endwh   = len(re.findall(r"\bendwhile\b", code))
    n_switch  = count_colon("switch")
    n_endsw   = len(re.findall(r"\bendswitch\b", code))

    # `elseif(...):` is counted as an opener above but shares one endif with
    # its `if`, so subtract those back out.
    n_elseif = len(re.findall(r"\belseif\s*\([^;{]*?\)\s*:", code))
    n_if -= n_elseif

    for name, opens, closes in (
        ("if/endif", n_if, n_endif),
        ("for/endfor", n_for, n_endfor),
        ("foreach/endforeach", n_fe, n_endfe),
        ("while/endwhile", n_while, n_endwh),
        ("switch/endswitch", n_switch, n_endsw),
    ):
        if opens != closes:
            problems.append("%s: %d opened, %d closed" % (name, opens, closes))

    opens_tag = len(re.findall(r"<\?php|<\?=", src))
    close_tag = src.count("?>")
    if close_tag > opens_tag:
        problems.append("more ?> (%d) than <?php (%d)" % (close_tag, opens_tag))

    return problems

roots = sys.argv[1:] or ["."]
files = []
for r in roots:
    if os.path.isfile(r):
        files.append(r)
    else:
        files += glob.glob(os.path.join(r, "**", "*.php"), recursive=True)

bad = 0
for fpath in sorted(set(files)):
    probs = check(fpath)
    rel = os.path.relpath(fpath)
    if probs:
        bad += 1
        print("  FAIL  %s" % rel)
        for p in probs:
            print("          %s" % p)
print()
print("  checked %d files, %d with structural problems" % (len(set(files)), bad))
